

module.exports = async function uploadToSkuVaultSingle(payload, tokens){
    const url = 'https://app.skuvault.com/api/products/createProduct';
    let response = await fetch(url,{
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "TenantToken": tokens.TenantToken,
            "UserToken": tokens.UserToken
        },
        body: JSON.stringify({
            ...payload,
            TenantToken:tokens.TenantToken,
            UserToken:tokens.UserToken
        })
    });
    return response;
}
