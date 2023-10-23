const ServerRequest = require("../serverRequester/serverRequester");
const ChannelAdvisorLimiters = require("../limiters/ChannelAdvisor");
const fsp = require("fs/promises");


const fs = require("fs");


module.exports = async function authorizeChannelAdvisor ({clientid,clientsecret,refreshtoken}) {
    const access_tokens = await fsp.readFile("./src/json/access_token.json").then(String).then(JSON.parse);
    if(access_tokens[refreshtoken]){
        let {time_created,access_token} = access_tokens[refreshtoken];
        // if time_created older than 59 minutes, get new token else return token
        time_created = new Date(time_created);
        const now = new Date();
        const timeSinceLastAuth = now - time_created;
        const safeInterval = 1000 * 60 * 60 - 2;
        if(timeSinceLastAuth < safeInterval){
            return access_token
        }
    }
    const authURL = 'https://api.channeladvisor.com/oauth2/token'
    const authHeader = {
        "Authorization": `Basic ${btoa(`${clientid}:${clientsecret}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    const body = new URLSearchParams();
    body.set('grant_type', 'refresh_token');
    body.set('refresh_token', refreshtoken);

    const requester = new ServerRequest(ChannelAdvisorLimiters.authLimiter);
    requester.headers = authHeader;
    requester.body = body;
    requester.method = 'POST';

    const accessTokenResponse = await requester.executeRequest(authURL);
    const accessTokenData = await accessTokenResponse.json();
    access_tokens[refreshtoken] = {
        time_created: new Date(),
        access_token: accessTokenData['access_token']
    }
    fs.writeFileSync("./src/json/access_token.json",JSON.stringify(access_tokens,null,2),{flag:"w"});
    return accessTokenData['access_token'];
}