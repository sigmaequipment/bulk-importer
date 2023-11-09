const createPromisePool = require("../promisePool/promisePool");
const {labelMaps} = require("../createChildrenFactory/createChildrenFactory");
const basicChannelAdvisorImport = require("./basicImport");
const conditions = Object.values(labelMaps);
const {log} = require("../Logger/logger");
const fetch = require("node-fetch");
async function channelAdvisorImport(channelAdvisorPayload,access_token,badSkus,completedItems){
    let parents = channelAdvisorPayload.filter(item=>item.IsParent)
    log(`Starting Channel Advisor Parent Import of ${parents.length} Items`)

    let parentResults = await basicChannelAdvisorImport(parents,access_token,badSkus)
    parentResults = parentResults.filter(({Sku})=>!badSkus.some(({Sku:badSku})=>badSku.includes(Sku)));
    log(`Finished Channel Advisor Parent Import`)
    const parentMap = {};
    parentResults.forEach(item=> {
        const {ID, Sku} = item;
        parentMap[Sku] = ID;
        completedItems.push(item);
    })
    log("The parentMap is: ",JSON.stringify(parentMap,null,2));
    log(`Starting Channel Advisor Flagging of ${parentResults.length} Items`)
    const flagRouteMaker = (ID,condition) => `https://api.channeladvisor.com/v1/Products(${ID})/Labels('${condition}')?access_token=${access_token}`;
    let promises = parentResults.map(({ID})=>{
        return conditions.map((condition)=>{
            return flagRouteMaker(ID,condition)
        })
    });

    const flagPool = createPromisePool(async (url)=> fetch(url,{method: 'PATCH'}), 5);
    const flagResults = await flagPool.process(promises.flat())
    log(`Flag Results are :  ${flagResults}`)
    let children = channelAdvisorPayload
        .filter(item=>!item.IsParent)
        .filter(({Sku})=>!badSkus.some(({Sku:badSku})=>badSku.includes(Sku.split("-")[0].trim())))
        .map((item)=>{
            let sku = item.Sku.split("-")[0];
            let parentID = parentMap[sku];
            return {...item,ParentProductID:parentID}
        })
    log(`Children : [${JSON.stringify(children,null,2)}]`)
    log(`Starting Channel Advisor Child Import of ${children.length} Items`)
    return await basicChannelAdvisorImport(children,access_token,badSkus,"ChannelAdvisorChildImport");
}
module.exports = channelAdvisorImport;