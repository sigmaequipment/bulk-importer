const fs = require('fs');
const fsp = require('fs/promises');
const ServerRequest = require('../serverRequester/serverRequester');
const authorizeChannelAdvisor = require('./authorize');
const channelAdvisorLimiter = require('../limiters/ChannelAdvisor');





// Errors
// The request is invalid.
//

function importProductToChannelAdvisor (access_token) {
     return (product)=> new Promise(async (res,rej)=> {
         const requester = new ServerRequest(channelAdvisorLimiter.authLimiter);

         requester.headers = {
             "Authorization": `Bearer ${access_token}`,
             "content-type": "application/json"
         }
         requester.body = product;
         requester.method = 'POST';

         const url = `https://api.channeladvisor.com/v1/Products?access_token=${access_token}`;
         let response = await fetch(url, {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${access_token}`,
                    "content-type": "application/json"
                },
                body: JSON.stringify(product)
         }).then((response) => response.json());
        // implement error logic here
         if(response.Message === "The request is invalid."){
             rej(response);
         }
         if(response.Message?.includes("SKU already exists")){
             rej(response);
         }
         if(response.error){
             rej(response);
         }
         res(response);
     })
}

module.exports = importProductToChannelAdvisor