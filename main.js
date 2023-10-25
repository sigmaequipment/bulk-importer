const Fastify = require('fastify');
const cors = require('@fastify/cors');
const registerSchema = require("./src/javascript/untestedModules/registerSchema");
const authorizeChannelAdvisor = require("./src/javascript/ChannelAdvisor/authorize");
const uploadToSkuVaultBulk = require("./src/javascript/skuVault/uploadBulk");
const uploadToSkuVaultSingle = require("./src/javascript/skuVault/upload");
const createPayloads = require("./src/javascript/untestedModules/createPayloads");
const SkuVaultImporter = require("./src/javascript/skuVault/importer");
const channelAdvisorImport = require("./src/javascript/ChannelAdvisor/fullImport");
const {log,error} = require("./src/javascript/Logger/logger");
const splitPayload = require('./src/javascript/splitPayload/splitPayload');

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
    let length = items.length;
    console.log(JSON.stringify(items,null,2))
    log(`Request To Start Import of ${length} Items`);
    const badSkus = [];
    const completedItems = [];
    let {channelAdvisorPayload,skuVaultPayload} = await createPayloads(items);
    log(`Finished Creating Payloads`)
    let uploadFunc;
    if(length > 1) {
        log("Bulk Import")
        uploadFunc = uploadToSkuVaultBulk;
        skuVaultPayload = splitPayload(skuVaultPayload)
        console.log(skuVaultPayload)
    }else{
        log("Single Route")
        uploadFunc = uploadToSkuVaultSingle;
    }
    await SkuVaultImporter(uploadFunc)(skuVaultPayload,tokens,badSkus)
    log(`${badSkus.length} Failed at Sku Vault`)
    // If A sku failed at the Sku Vault step, This filters it out of the Channel Advisor Payload,
    // so we don't upload.js a bad sku to Channel Advisor
    let filteredChannelAdvisorPayload = channelAdvisorPayload.filter(({Sku})=>!badSkus.some(({Sku:badSku})=>badSku.includes(Sku)))
    if(filteredChannelAdvisorPayload.length === 0) return reply.send({badSkus});
    log(`Starting Channel Advisor Import of ${filteredChannelAdvisorPayload.length} Items`)

    const access_token = await authorizeChannelAdvisor(tokens);
    log(`Finished Authorizing Channel Advisor`)
    let results = await channelAdvisorImport(
        filteredChannelAdvisorPayload,
        access_token,
        badSkus,
        completedItems
        )
    log(`Finished Channel Advisor Import`)
    results = results.concat(completedItems);
    log(`Finished Importing ${results.length} Items`)
    reply.send({badSkus,
        results
    });
});

fastify.listen({port: 3005, host:"10.100.100.51"},(err,addr)=>{
    if(err){
        error(err)
        process.exit(1)
    }
    log(`Server listening at ${addr}`)
})