const Fastify = require('fastify');
const cors = require('@fastify/cors');
const registerSchema = require("./src/javascript/untestedModules/registerSchema");
const authorizeChannelAdvisor = require("./src/javascript/ChannelAdvisor/authorize");
const uploadToSkuVaultBulk = require("./src/javascript/skuVault/uploadBulk");
const uploadToSkuVaultSingle = require("./src/javascript/skuVault/upload");
const createPayloads = require("./src/javascript/untestedModules/createPayloads");
const SkuVaultImporter = require("./src/javascript/skuVault/importer");
const channelAdvisorImport = require("./src/javascript/ChannelAdvisor/fullImport");
const {log, error} = require("./src/javascript/Logger/logger");
const splitPayload = require('./src/javascript/splitPayload/splitPayload');
const timeoutWrapper = require("./src/javascript/timeoutWrapper/main");
const PayloadError = require("./src/javascript/payloadError");
const parseDescription = require("./src/javascript/utils/parseDescription");


require("dotenv").config();

const timeoutMinutes = 2;
const timeout = timeoutMinutes * 60 * 1000;
const seperator = "------------------------------------"
log(seperator)
log("*** Bulk Importer (Beta) V1 ***");
log("*** Last Updated: 10/26/23 ***");
log("Original Python Code By: Christian Guzman & Brandon Weisman");
log("Current Javascript Iteration By: Michael Walker");
log("Proud to be employee owned");
log(seperator)


const fastify = Fastify({
    logger: false
});

/*
 docs
 https://github.com/fastify/fastify-cors
*/
fastify.register(cors, {
    origin: '*'
});

/**
 * @typedef {Object} PayloadError
 * @property {string} Sku - The Sku of the item that failed
 * @property {string} ErrorMessage - The Error Message
 * @property {string} FailedAt - The step in the process that the item failed at
 */

registerSchema("./src/json/schema.json", fastify)
const incomingPayloadSchema = {
    schema: {
        body: {
            $ref: 'incomingPayload#'
        }
    }
}


fastify.get("/restart", (req, reply) => {
    // this route needs to restart the service
    // this is done with sudo systemctl restart importer
    const {loginString} = req.query;
    if (!loginString) {
        reply.send("No Login String Found")
    }
    if (loginString !== process.env.LOGIN_STRING) {
        reply.send("Invalid Login String")
    }
    const {spawn} = require("child_process");

    const proc = spawn("sh", ["-c", `echo ${process.env.PASSWORD} | sudo -S bash -c "sudo systemctl restart importer"`]);
    proc.stdout.on("data", (data) => {
        log(data.toString());
    })
    proc.stderr.on("data", (data) => {
        error(data.toString());
    })
    proc.on("close", (code) => {
        log(`child process exited with code ${code}`);
    })

})


fastify.get("/log", (req, reply) => {
    const date = new Date();
    const fileName = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-log.log`;
    let log = require('fs').readFileSync(`./logs/${fileName}`, 'utf8');
    reply.send(log);
})


fastify.post("/log", async (req, reply) => {
    const body = req.body;
    let message = body.message;
    if (!message) {
        reply.send("No message found ")
    }
    log(message);
    reply.send({message});
})

fastify.post('/import', incomingPayloadSchema, async (request, reply) => {
    const {body: {items, tokens}} = request;
    let length = items.length;
    log(seperator)
    log(`Request To Start Import of ${length} Items`);
    const badSkus = [];
    const completedItems = [];
    let {channelAdvisorPayload, skuVaultPayload} = await createPayloads(items);

    const ATTRIBUTES_BASE_URL = "http://10.100.100.42:3005/"
    let categoriesWithAttributes = await fetch(ATTRIBUTES_BASE_URL)
        .then(res => res.json())
        .catch(()=>console.warn("Error Fetching Categories With Attributes"))
    if( !categoriesWithAttributes || categoriesWithAttributes.length === 0) {
        log("No Categories With Attributes Found")
    }else{
        for (let item of channelAdvisorPayload) {
            let {Classification, Description} = item;
            if (categoriesWithAttributes.includes(Classification)) {
                let CADestinations = await fetch(ATTRIBUTES_BASE_URL + Classification + "/attributes")
                    .then(res => res.json())
                const values = parseDescription(Description, Object.keys(CADestinations))
                for (let [key, value] of Object.entries(values)) {
                    item.Attributes.push({
                        "Name": CADestinations[key],
                        "Value": value
                    })
                }
            }
        }
    }

    try {
        log(`Finished Creating Payloads`)
        log(`Sku Vault Payload Length: ${skuVaultPayload.length}`)
        log(`Channel Advisor Payload Length: ${channelAdvisorPayload.length}`)
        log(seperator)
        log(`Starting Sku Vault Import of ${skuVaultPayload.length} Items`)
        let uploadFunc;
        if (length > 1) {
            log("Bulk Import")
            uploadFunc = uploadToSkuVaultBulk;
            skuVaultPayload = splitPayload(skuVaultPayload)
        } else {
            log("Single Route")
            uploadFunc = uploadToSkuVaultSingle;
        }
        await timeoutWrapper(timeout)(SkuVaultImporter(uploadFunc), skuVaultPayload, tokens, badSkus)
        log(`${badSkus.length} Failed at Sku Vault`)
        // If A sku failed at the Sku Vault step, This filters it out of the Channel Advisor Payload,
        // so we don't upload.js a bad sku to Channel Advisor
        let filteredChannelAdvisorPayload = channelAdvisorPayload.filter(({Sku}) => !badSkus.some(({Sku: badSku}) => badSku.includes(Sku)))
        if (filteredChannelAdvisorPayload.length === 0) return reply.send({badSkus});
        log(seperator)

        const access_token = await timeoutWrapper(timeout / 2)(authorizeChannelAdvisor, tokens);

        log(`Finished Authorizing Channel Advisor`)
        log(seperator)
        log(`Starting Channel Advisor Import of ${filteredChannelAdvisorPayload.length} Items`)

        let results = await timeoutWrapper(timeout)(channelAdvisorImport,
            filteredChannelAdvisorPayload,
            access_token,
            badSkus,
            completedItems
        )

        log(`Finished Channel Advisor Import`)
        log(seperator)

        results = results.concat(completedItems);

        log(`The importer has finished importing ${results.length} items`)

        if (filteredChannelAdvisorPayload.length < results.length) {
            log(`The importer has failed to import ${results.length - filteredChannelAdvisorPayload.length} items into Channel Advisor`)
        }

        log(seperator)
        reply.send({
            badSkus,
            results
        });

    } catch (e) {
        error("Error Importing")
        error("The Error Is:", e)
        console.log(e)
        let badSkus = items.map(({inventory_sku}) => (new PayloadError(`${inventory_sku}`, [e], "Time out")))
        reply.send({
            badSkus,
            results: []
        })
    }
});

let serverOptions = {
    port: 3005
}
if (process.env.HOST_ADDRESS) {
    serverOptions["host"] = process.env.HOST_ADDRESS
}
fastify.listen(serverOptions, (err, addr) => {
    if (err) {
        error(err)
        process.exit(1)
    }
    log(seperator)
    log(`Server listening at ${addr}`)
    log(seperator)
})