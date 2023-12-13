const PayloadError = require("../payloadError");
const createPromisePool = require("../promisePool/promisePool");
const importProductToChannelAdvisor = require("./import");

module.exports = async function basicChannelAdvisorImport(payload,access_token,badSkus,location="ChannelAdvisorParentImport"){
    const pool = createPromisePool(importProductToChannelAdvisor(access_token), 5);
    let channelAdvisorResults = await pool.process(payload);

    let {results,errors} = channelAdvisorResults;
    if(errors.length){
        errors.forEach(({item,raw})=>{
            const {Message:ErrorMessage} = raw;
            const {Sku} = item;
            badSkus.push(new PayloadError(Sku,ErrorMessage,location))
        })
    }
    return results
}