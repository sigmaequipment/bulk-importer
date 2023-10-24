const formatDataForSkuVault = require("../formatDataForSkuVault/formatDataforSkuVault");
const formatItem = require("./propertyFormatter");

/**
 * @function
 * @param items
 * @return {Object<{channelAdvisorPayload: FlatArray<*, 1>[], skuVaultPayload: []}>}
 */
module.exports = async function createPayloads (items) {
    let skuVaultPayload = formatDataForSkuVault(items)
    let channelAdvisorPayload = items.map(formatItem).flat()
    return {
        channelAdvisorPayload,
        skuVaultPayload}
}