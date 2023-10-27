const ServerRequest = require('../serverRequester/serverRequester');
const channelAdvisorLimiter = require('../limiters/ChannelAdvisor');
const {error:err} = require('../Logger/logger');
const fetch = require("node-fetch");



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
         })
         try {
             response = await response.json();
         } catch (e) {
             response = await response.text();
             err(e);
         }
        // implement error logic here
         if(response?.Message === "The request is invalid."){
             err(e);
             rej(response);
         }
         if(response?.Message?.includes("SKU already exists")){
             err(e);
             rej(response);
         }
         if(response?.error){
             err(e);
             rej(response);
         }
         res(response);
     })
}

module.exports = importProductToChannelAdvisor