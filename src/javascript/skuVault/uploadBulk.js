const ServerRequest = require("../serverRequester/serverRequester");
const skuVaultLimiters = require("../limiters/skuVault");
module.exports = async function uploadToSkuVaultBulk(payload, tokens){
    console.log("here")
    let skuVaultRequester = new ServerRequest(skuVaultLimiters.heavy);
    skuVaultRequester.method = 'POST';
    skuVaultRequester.headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "TenantToken": tokens.TenantToken,
        "UserToken": tokens.UserToken
    };
    skuVaultRequester.body = JSON.stringify({
        Items:payload,
        TenantToken:tokens.TenantToken,
        UserToken:tokens.UserToken
    })
    const url = 'https://app.skuvault.com/api/products/createProducts';
    return await skuVaultRequester.executeRequest(url);
}
