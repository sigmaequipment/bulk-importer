const createPromisePool = require("../promisePool/promisePool");
module.exports = function SkuVaultImporter(uploadFunction){
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