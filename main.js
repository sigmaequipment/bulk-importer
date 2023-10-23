const Fastify = require('fastify');
const cors = require('@fastify/cors');
const formatDataForSkuVault = require("./src/javascript/formatDataForSkuVault/formatDataforSkuVault");
const registerSchema = require("./src/javascript/untestedModules/registerSchema");
const authorizeChannelAdvisor = require("./src/javascript/ChannelAdvisor/authorize");
const formatItem = require("./src/javascript/untestedModules/propertyFormatter");
const uploadToSkuVault = require("./src/javascript/skuVault/upload");
const importProductToChannelAdvisor = require("./src/javascript/ChannelAdvisor/import");
const createPromisePool = require("./src/javascript/promisePool/promisePool");
const {conditionsMap} = require("./src/javascript/createChildrenFactory/createChildrenFactory");
const stream = require("stream");
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

function channelAdvisorImport(channelAdvisorPayload,access_token){
    const badSkus = [];
    let parents = channelAdvisorPayload
        .filter(item=>item.IsParent)
        .map(item=>{
            delete item.Attributes;
            return item;
        })
    let children = channelAdvisorPayload.filter(item=>!item.IsParent);

    const pool = createPromisePool(importProductToChannelAdvisor(access_token), 5);
    const flagPool = createPromisePool(async (url)=> fetch(url,{method: 'PATCH'}), 5);

    return pool.process(parents)
        .then(({results,errors}) => {
            let errs=errors.map((error) => error.item)
            badSkus.push(...errs);
            console.log("badSkus:",badSkus)
            console.log("results:",results)
            return results
        })
        .then((results) => {
            const flagRouteMaker = (ID,condition) => `https://api.channeladvisor.com/v1/Products(${ID})/Labels('${condition}')?access_token=${access_token}`;
            let promises = results.map(({ID})=>{
                return conditions.map((condition,i)=>{
                    return flagRouteMaker(ID,condition)
                })
            });
            flagPool.process(promises.flat())
                .then(({results,errors})=>{
                    results
                        .filter(result=>result.status !== 204)
                        .forEach(result=>{errors.push(result)})
                    return results.filter(result=>result.status === 204)
                })
        })
        .then((res)=>{
            return {res,badSkus}
        })
}





fastify.post('/import',incomingPayloadSchema, async (request,reply) => {
    const {body:{items,tokens}} = request;
    const {channelAdvisorPayload,skuVaultPayload} = await createPayloads(items);
    const access_token = await authorizeChannelAdvisor(tokens);
    const response = await uploadToSkuVault(skuVaultPayload,tokens);
    const {Status,Errors} = await response.json();
    console.log(response.statusText)
    // parse the response body
    let responseBody = await response;
    console.log(responseBody)



    const {status,statusMessage} = response;
    if(status === 202){

    }

    reply.send({channelAdvisorPayload,skuVaultPayload,access_token});
});

fastify.listen({port: 3005},(err,addr)=>{
    if(err){
        console.log(err)
        process.exit(1)
    }
    console.log(`Server listening at ${addr}`)
})