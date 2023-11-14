const ServerRequest = require("../serverRequester/serverRequester");
const skuVaultLimiters = require("../limiters/skuVault");

module.exports = async function uploadToSkuVaultSingle(payload, tokens){
    let skuVaultRequester = new ServerRequest(skuVaultLimiters.heavy);
    skuVaultRequester.method = 'POST';
    skuVaultRequester.headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "TenantToken": tokens.TenantToken,
        "UserToken": tokens.UserToken
    };
    skuVaultRequester.body = JSON.stringify({
        ...payload,
        TenantToken:tokens.TenantToken,
        UserToken:tokens.UserToken
    })
    const url = 'https://app.skuvault.com/api/products/createProduct';
    let response = await skuVaultRequester.executeRequest(url);
    let remaining = +response.headers.get("X-RateLimit-Remaining");
    skuVaultLimiters.heavy.updateSettings({
        reservoir: remaining,
    })
    return response;
}
