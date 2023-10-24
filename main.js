const Fastify = require('fastify');
const cors = require('@fastify/cors');
const formatDataForSkuVault = require("./src/javascript/formatDataForSkuVault/formatDataforSkuVault");
const registerSchema = require("./src/javascript/untestedModules/registerSchema");
const authorizeChannelAdvisor = require("./src/javascript/ChannelAdvisor/authorize");
const formatItem = require("./src/javascript/untestedModules/propertyFormatter");
const uploadToSkuVaultBulk = require("./src/javascript/skuVault/uploadBulk");
const uploadToSkuVaultSingle = require("./src/javascript/skuVault/upload");
const importProductToChannelAdvisor = require("./src/javascript/ChannelAdvisor/import");
const createPromisePool = require("./src/javascript/promisePool/promisePool");
const {conditionsMap} = require("./src/javascript/createChildrenFactory/createChildrenFactory");
const splitPayload = require("./src/javascript/splitPayload/splitPayload");

const conditions = Object.values(conditionsMap);
const fastify = Fastify({
    logger: true
});

/*
 docs
 https://github.com/fastify/fastify-cors
*/
fastify.register(cors, {
    origin: '*'
});



registerSchema("./src/json/schema.json",fastify)
const incomingPayloadSchema ={
    schema:{
        body:{
            $ref:'incomingPayload#'
          }
    }
}

/**
 * @function
 * @param items
 * @return {Object<{channelAdvisorPayload: FlatArray<*, 1>[], skuVaultPayload: []}>}
 */
async function createPayloads (items) {
    let skuVaultPayload = formatDataForSkuVault(items)
    let channelAdvisorPayload = items.map(formatItem).flat()
    return {
        channelAdvisorPayload,
        skuVaultPayload}
}

async function basicChannelAdvisorImport(payload,access_token,badSkus,location="ChannelAdvisorParentImport"){
    const pool = createPromisePool(importProductToChannelAdvisor(access_token), 5);
    let channelAdvisorResults = await pool.process(payload);

    let {results,errors} = channelAdvisorResults;
    if(errors.length){
        errors.forEach(({item,raw})=>{
            const {Message:ErrorMessage} = raw;
            const {Sku} = item;
            badSkus.push({Sku,ErrorMessage,FailedAt:location})
        })
    }
    return results
}


async function channelAdvisorImport(channelAdvisorPayload,access_token,badSkus,completedItems){
    let parents = channelAdvisorPayload.filter(item=>item.IsParent)

    let parentResults = await basicChannelAdvisorImport(parents,access_token,badSkus)
        parentResults = parentResults.filter(({Sku})=>!badSkus.some(({Sku:badSku})=>badSku.includes(Sku)));

    const parentMap = {};
    parentResults.forEach(item=> {
            const {ID, Sku} = item;
            parentMap[Sku] = ID;
            completedItems.push(item);
        })
    const flagRouteMaker = (ID,condition) => `https://api.channeladvisor.com/v1/Products(${ID})/Labels('${condition}')?access_token=${access_token}`;
    let promises = parentResults.map(({ID})=>{
             return conditions.map((condition)=>{
                 return flagRouteMaker(ID,condition)
             })
    });

    const flagPool = createPromisePool(async (url)=> fetch(url,{method: 'PATCH'}), 5);
    const flagResults = await flagPool.process(promises.flat())
    const {results:flaggedResults} = flagResults;
    
    let children = channelAdvisorPayload
        .filter(item=>!item.IsParent)
        .filter(({Sku})=>!badSkus.some(({Sku:badSku})=>badSku.includes(Sku.split("-")[0].trim())))
        .map((item)=>{
                let sku = item.Sku.split("-")[0];
                let parentID = parentMap[sku];
                return {...item,ParentProductID:parentID}
        })
    return await basicChannelAdvisorImport(children,access_token,badSkus,"ChannelAdvisorChildImport");
}



function SkuVaultImporter(uploadFunction){
    return async (payload,token,badSkus) =>{
        const pool = createPromisePool((item)=>uploadFunction(item,token), 5);
        let skuVaultResults = await pool.process(payload)
        let responses = await Promise.all(skuVaultResults.results.map(result=>result.json()));

        responses.forEach(({Status,Errors})=>{
            console.log("Status:",Status)
            Errors.forEach(error=>{
                badSkus.push({...error,FailedAt:"SkuVaultSingleImport"})
            })
        })
        return responses
    }
}





fastify.post('/import',incomingPayloadSchema, async (request,reply) => {
    const {body:{items,tokens}} = request;
    const badSkus = [];
    const completedItems = [];
    let {channelAdvisorPayload,skuVaultPayload} = await createPayloads(items);
    let uploadFunc;
    if(skuVaultPayload.length > 1) {
        console.log("Bulk Import")
        uploadFunc = uploadToSkuVaultBulk;
    }else{
        console.log("Single Route")
        uploadFunc = uploadToSkuVaultSingle;
        skuVaultPayload = skuVaultPayload[0];
    }
    await SkuVaultImporter(uploadFunc)(skuVaultPayload,tokens,badSkus)
    // If A sku failed at the Sku Vault step, This filters it out of the Channel Advisor Payload,
    // so we don't upload.js a bad sku to Channel Advisor
    let filteredChannelAdvisorPayload = channelAdvisorPayload.filter(({Sku})=>!badSkus.some(({Sku:badSku})=>badSku.includes(Sku)))
    if(filteredChannelAdvisorPayload.length === 0) return reply.send({badSkus});

    const access_token = await authorizeChannelAdvisor(tokens);

    let results = await channelAdvisorImport(
        filteredChannelAdvisorPayload,
        access_token,
        badSkus,
        completedItems
        )
    results = results.concat(completedItems);

    reply.send({badSkus,results});
});

fastify.listen({port: 3005},(err,addr)=>{
    if(err){
        console.log(err)
        process.exit(1)
    }
    console.log(`Server listening at ${addr}`)
})