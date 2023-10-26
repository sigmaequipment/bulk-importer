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
const seperator = "------------------------------------"
log(seperator)
log("*** Bulk Importer (Beta) V1 ***");
log("*** Last Updated: 10/26/23 ***");
log("Original Python Code By: Christian Guzman & Brandon Weisman");
log("Current Javascript Iteration By: Michael Walker");
log("Proud to be employee owned");
log(seperator)


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
    log(seperator)
    log(`Request To Start Import of ${length} Items`);
    const badSkus = [];
    const completedItems = [];
    let {channelAdvisorPayload,skuVaultPayload} = await createPayloads(items);
    log(`Finished Creating Payloads`)
    log(`Sku Vault Payload Length: ${skuVaultPayload.length}`)
    log(`Channel Advisor Payload Length: ${channelAdvisorPayload.length}`)
    log(seperator)
    log(`Starting Sku Vault Import of ${skuVaultPayload.length} Items`)
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
    log(seperator)
    const access_token = await authorizeChannelAdvisor(tokens);
    log(`Finished Authorizing Channel Advisor`)
    log(seperator)
    log(`Starting Channel Advisor Import of ${filteredChannelAdvisorPayload.length} Items`)
    let results = await channelAdvisorImport(
        filteredChannelAdvisorPayload,
        access_token,
        badSkus,
        completedItems
        )
    log(`Finished Channel Advisor Import`)
    log(seperator)
    results = results.concat(completedItems);
    log(`The importer has finished importing ${results.length} items`)
    log(seperator)
    reply.send({badSkus,
        results
    });
});

fastify.listen({port: 3005, host:"10.100.100.51"},(err,addr)=>{
    if(err){
        error(err)
        process.exit(1)
    }
    log(seperator)
    log(`Server listening at ${addr}`)
    log(seperator)
})