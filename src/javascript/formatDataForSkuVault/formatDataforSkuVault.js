

/**
* @function
 * @name formatDataforSkuVault
 * @param {Object} items - The items object from the original call
 * @return {Array} - The formatted array of items
 * @description - This function takes the items object from the original call
 * and formats it into an array of objects that can be used to create the items in SkuVault
 */
/*
    **********  EXTERNAL API INFORMATION  **********
    * API Name: SkuVault
    * ROUTE NAME: /products/createProducts
    * METHOD: POST
    * URL: https://app.skuvault.com/api/products/createProducts
    * THROTTLE LIMIT: 5 calls per minute 100 items per call
    * HEADERS:
        * Content-Type: application/json
        * Accept: application/json
    * BODY:
        * Tenant Token: string
        * User Token: string
        * Items: array of objects
            * Sku: string required
            * Description: string
            * Classification: string required
            * Supplier: string required
            * Brand: string required
            * PartNumber: string
            * AllowCreateAp: boolean
            * IsSerialized: boolean
    *
 */
const formatItem = require("../untestedModules/propertyFormatter");
module.exports = function formatDataForSkuVault(items) {
    let conditions = ['-1','-2','-3','-4'];
    let formattedData = [];
    for (let i = 0; i < items.length; i++) {
        let formattedItems = formatItem(items[i]);
        const {Sku,Title, Brand, Classification, MPN,} = formattedItems[0];
        for (let j = 0; j < conditions.length; j++) {
            let attributes = formattedItems[j]["Attributes"];
            let formattedCondition = attributes.find(({Name}) => Name === "(03.) Condition")?.Value;
            let condition = conditions[j];
            let tempItem = {
                Sku: Sku + condition,
                Description: Title.toUpperCase(),
                Classification: Classification,
                Supplier: "Unknown",
                Brand: Brand,
                PartNumber: MPN,
                VariationParentSku: Sku,
                Attributes: {"Condition": formattedCondition},
                allowCreateAp: false,
                IsSerialized: false,
            }
            formattedData.push(tempItem);
        }
    }
    return formattedData;
}