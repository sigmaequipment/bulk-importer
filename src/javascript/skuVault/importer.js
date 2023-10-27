const { log, error:err } = require("../Logger/logger");
const createPromisePool = require("../promisePool/promisePool");
module.exports = function SkuVaultImporter(uploadFunction){
    return async (payload,token,badSkus) =>{
    try{
        const pool = createPromisePool((item)=>uploadFunction(item,token), 5);
        let skuVaultResults = await pool.process(payload)
        let responses = await Promise.all(skuVaultResults.results.map(result=>result.json()));
        log("Finished Uploading To Sku Vault")
        log("The Responses From Sku Vault Are:",responses.map(({Status})=>Status))
        log("Checking For Errors")
        responses.forEach(({Status,Errors},i)=>{
            Errors.forEach((error)=>{
                error = uploadFunction.name.toLowerCase().includes("single") ? {Sku:payload[i].Sku,ErrorMessages:[error]} : {...error}
                badSkus.push({...error,FailedAt:uploadFunction.name})
            })
        })
        return responses
    }catch(e){
        console.log(e)
    }

    }
}