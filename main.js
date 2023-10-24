const Fastify = require('fastify');
const cors = require('@fastify/cors');
const registerSchema = require("./src/javascript/untestedModules/registerSchema");
const authorizeChannelAdvisor = require("./src/javascript/ChannelAdvisor/authorize");
const uploadToSkuVaultBulk = require("./src/javascript/skuVault/uploadBulk");
const uploadToSkuVaultSingle = require("./src/javascript/skuVault/upload");
const createPayloads = require("./src/javascript/untestedModules/createPayloads");
const SkuVaultImporter = require("./src/javascript/skuVault/importer");
const channelAdvisorImport = require("./src/javascript/ChannelAdvisor/fullImport");

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

fastify.post('/import',incomingPayloadSchema, async (request,reply) => {
    const {body:{items,tokens}} = request;
    console.log(items)
    const badSkus = [];
    const completedItems = [];
    let {channelAdvisorPayload,skuVaultPayload} = await createPayloads(items);
    let length = items.length;
    let uploadFunc;
    if(length > 1) {
        console.log("Bulk Import")
        uploadFunc = uploadToSkuVaultBulk;
    }else{
        console.log("Single Route")
        uploadFunc = uploadToSkuVaultSingle;
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