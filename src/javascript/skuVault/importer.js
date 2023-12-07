const { log, error:err } = require("../Logger/logger");
const createPromisePool = require("../promisePool/promisePool");
module.exports = function SkuVaultImporter(uploadFunction){
    return async (payload,token,badSkus) =>{
        try{
            const pool = createPromisePool((item)=>uploadFunction(item,token), 5);
            log("Creating Promise Pool")
            let skuVaultResults = await pool.process(payload)
            console.log(skuVaultResults)
            log("Uploading To Sku Vault")
            let responses = await Promise.all(skuVaultResults.results.map(result=>result.json()));
            console.log(responses)
            log("Finished Uploading To Sku Vault")
            log("The Responses From Sku Vault Are:",responses.map(({Status})=>Status))
            log("Checking For Errors")
            responses.forEach(({Status,Errors},i)=>{
                Errors.forEach((error)=>{
                    error = uploadFunction.name.toLowerCase().includes("single") ? {Sku:payload[i].Sku,ErrorMessages:[error]} : {...error}
                    err(JSON.stringify(error))
                    badSkus.push({...error,FailedAt:uploadFunction.name})
                })
            })
            return responses
        }catch(e){
            err("Error Uploading To Sku Vault")
            err("The Error Is:",e)
            console.log(e)
            payload.forEach(({Sku})=>{
                badSkus.push({Sku,ErrorMessages:[e.message],FailedAt:uploadFunction.name})
            })
            return []
        }
    }
}