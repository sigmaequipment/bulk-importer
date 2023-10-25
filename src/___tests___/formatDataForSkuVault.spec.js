import {describe,expect,test} from "vitest";
/*
    **********  INTERNAL API INFORMATION  **********
    this is the data that we will get from the consumer of the API
    "items":[
        {
            "id": 7686,
            "item_name": "ALLEN BRADLEY 0-A16",
            "part_number": "0-A16",
            "brand": "ALLEN BRADLEY",
            "description": "DISCONTINUED BY MANUFACTURER, COIL, 550 VAC, 60 HZ, SCREW TERMINAL",
            "item_category": "COIL",
            "weight": "0.12 lbs",
            "estimated_value": "Not Listed",
            "authorized_distr_brokerage_price": "Not Listed",
            "original_packaging_price": 137,
            "radwell_packaging_price": 119,
            "refurbished_price": 110,
            "repair_price": "Not Listed",
            "last_price_update": "3/17/2021",
            "link": "http://www.radwell.com/Buy/ALLEN%20BRADLEY/ALLEN%20BRADLEY/0-A16",
            "flagged": 0,
            "lister_sku": 1083495,
            "apn": "Not Listed",
            "suggested_category": "COIL",
            "sigma_category": "Coil",
            "sigma_sku": "NULL",
            "sigma_part_number": "NULL",
            "approval_time": "NULL",
            "user_who_approved": "NULL",
            "inventory_sku": 244753,
            "series": "NULL",
            "source": "NULL"
        }
    ]
 */

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
    function formatDataForSkuVault(items) {
        let conditions = ['-1','-2','-3','-4'];
        let formattedData = [];
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            const {item_name, part_number, brand, sigma_category, inventory_sku, series,} = item;
            for (let j = 0; j < conditions.length; j++) {
                let condition = conditions[j];
                let tempItem = {
                    Sku: item_name + condition,
                    Description: item_name + series + sigma_category,
                    Classification: sigma_category,
                    Supplier: "Unknown",
                    Brand: brand,
                    PartNumber: part_number,
                    VariationParentSku: inventory_sku,
                    allowCreateAp: false,
                    IsSerialized: false,
                }
                formattedData.push(tempItem);
            }
        }
        return formattedData;
    }

describe('formatDataForSkuVault', () => {
    test('should format data correctly', () => {
        const items = [
            {
                "id": 7686,
                "item_name": "ALLEN BRADLEY 0-A16",
                "part_number": "0-A16",
                "brand": "ALLEN BRADLEY",
                "description": "DISCONTINUED BY MANUFACTURER, COIL, 550 VAC, 60 HZ, SCREW TERMINAL",
                "item_category": "COIL",
                "weight": "0.12 lbs",
                "estimated_value": "Not Listed",
                "authorized_distr_brokerage_price": "Not Listed",
                "original_packaging_price": 137,
                "radwell_packaging_price": 119,
                "refurbished_price": 110,
                "repair_price": "Not Listed",
                "last_price_update": "3/17/2021",
                "link": "http://www.radwell.com/Buy/ALLEN%20BRADLEY/ALLEN%20BRADLEY/0-A16",
                "flagged": 0,
                "lister_sku": 1083495,
                "apn": "Not Listed",
                "suggested_category": "COIL",
                "sigma_category": "Coil",
                "sigma_sku": "NULL",
                "sigma_part_number": "NULL",
                "approval_time": "NULL",
                "user_who_approved": "NULL",
                "inventory_sku": 244753,
                "series": "NULL",
                "source": "NULL"
            }
        ];
        const expectedData = [
            {
                Sku: 'ALLEN BRADLEY 0-A16-1',
                Description: 'ALLEN BRADLEY 0-A16NULLCoil',
                Classification: 'Coil',
                Supplier: 'Unknown',
                Brand: 'ALLEN BRADLEY',
                PartNumber: '0-A16',
                VariationParentSku: 244753,
                allowCreateAp: false,
                IsSerialized: false
            },
            {
                Sku: 'ALLEN BRADLEY 0-A16-2',
                Description: 'ALLEN BRADLEY 0-A16NULLCoil',
                Classification: 'Coil',
                Supplier: 'Unknown',
                Brand: 'ALLEN BRADLEY',
                PartNumber: '0-A16',
                VariationParentSku: 244753,
                allowCreateAp: false,
                IsSerialized: false
            },
            {
                Sku: 'ALLEN BRADLEY 0-A16-3',
                Description: 'ALLEN BRADLEY 0-A16NULLCoil',
                Classification: 'Coil',
                Supplier: 'Unknown',
                Brand: 'ALLEN BRADLEY',
                PartNumber: '0-A16',
                VariationParentSku: 244753,
                allowCreateAp: false,
                IsSerialized: false
            },
            {
                Sku: 'ALLEN BRADLEY 0-A16-4',
                Description: 'ALLEN BRADLEY 0-A16NULLCoil',
                Classification: 'Coil',
                Supplier: 'Unknown',
                Brand: 'ALLEN BRADLEY',
                PartNumber: '0-A16',
                VariationParentSku: 244753,
                allowCreateAp: false,
                IsSerialized: false
            }
        ];
        const formattedData = formatDataForSkuVault(items);
        expect(formattedData).toEqual(expectedData);
    });

    test('should return an empty array when passed an empty array', () => {
        const items = [];
        const expectedData = [];
        const formattedData = formatDataForSkuVault(items);
        expect(formattedData).toEqual(expectedData);
    });

    test('should handle items with null values', () => {
        const items = [
            {
                "id": 7686,
                "item_name": "ALLEN BRADLEY 0-A16",
                "part_number": "0-A16",
                "brand": "ALLEN BRADLEY",
                "description": "DISCONTINUED BY MANUFACTURER, COIL, 550 VAC, 60 HZ, SCREW TERMINAL",
                "item_category": "COIL",
                "weight": "0.12 lbs",
                "estimated_value": "Not Listed",
                "authorized_distr_brokerage_price": "Not Listed",
                "original_packaging_price": 137,
                "radwell_packaging_price": 119,
                "refurbished_price": 110,
                "repair_price": "Not Listed",
                "last_price_update": "3/17/2021",
                "link": "http://www.radwell.com/Buy/ALLEN%20BRADLEY/ALLEN%20BRADLEY/0-A16",
                "flagged": 0,
                "lister_sku": 1083495,
                "apn": "Not Listed",
                "suggested_category": "COIL",
                "sigma_category": "Coil",
                "sigma_sku": "NULL",
                "sigma_part_number": "NULL",
                "approval_time": "NULL",
                "user_who_approved": "NULL",
                "inventory_sku": null,
                "series": null,
                "source": null
            }
        ];
        const expectedData = [
            {
                Sku: 'ALLEN BRADLEY 0-A16-1',
                Description: 'ALLEN BRADLEY 0-A16nullCoil',
                Classification: 'Coil',
                Supplier: 'Unknown',
                Brand: 'ALLEN BRADLEY',
                PartNumber: '0-A16',
                VariationParentSku: null,
                allowCreateAp: false,
                IsSerialized: false
            },
            {
                Sku: 'ALLEN BRADLEY 0-A16-2',
                Description: 'ALLEN BRADLEY 0-A16nullCoil',
                Classification: 'Coil',
                Supplier: 'Unknown',
                Brand: 'ALLEN BRADLEY',
                PartNumber: '0-A16',
                VariationParentSku: null,
                allowCreateAp: false,
                IsSerialized: false
            },
            {
                Sku: 'ALLEN BRADLEY 0-A16-3',
                Description: 'ALLEN BRADLEY 0-A16nullCoil',
                Classification: 'Coil',
                Supplier: 'Unknown',
                Brand: 'ALLEN BRADLEY',
                PartNumber: '0-A16',
                VariationParentSku: null,
                allowCreateAp: false,
                IsSerialized: false
            },
            {
                Sku: 'ALLEN BRADLEY 0-A16-4',
                Description: 'ALLEN BRADLEY 0-A16nullCoil',
                Classification: 'Coil',
                Supplier: 'Unknown',
                Brand: 'ALLEN BRADLEY',
                PartNumber: '0-A16',
                VariationParentSku: null,
                allowCreateAp: false,
                IsSerialized: false
            }
        ];
        const formattedData = formatDataForSkuVault(items);
        expect(formattedData).toEqual(expectedData);
    });

    test('should handle items with undefined values', () => {
        const items = [
            {
                "id": 7686,
                "item_name": "ALLEN BRADLEY 0-A16",
                "part_number": "0-A16",
                "brand": "ALLEN BRADLEY",
                "description": "DISCONTINUED BY MANUFACTURER, COIL, 550 VAC, 60 HZ, SCREW TERMINAL",
                "item_category": "COIL",
                "weight": "0.12 lbs",
                "estimated_value": "Not Listed",
                "authorized_distr_brokerage_price": "Not Listed",
                "original_packaging_price": 137,
                "radwell_packaging_price": 119,
                "refurbished_price": 110,
                "repair_price": "Not Listed",
                "last_price_update": "3/17/2021",
                "link": "http://www.radwell.com/Buy/ALLEN%20BRADLEY/ALLEN%20BRADLEY/0-A16",
                "flagged": 0,
                "lister_sku": 1083495,
                "apn": "Not Listed",
                "suggested_category": "COIL",
                "sigma_category": "Coil",
                "sigma_sku": "NULL",
                "sigma_part_number": "NULL",
                "approval_time": "NULL",
                "user_who_approved": "NULL",
                "inventory_sku": undefined,
                "series": undefined,
                "source": undefined
            }
        ];
        const expectedData = [
            {
                Sku: 'ALLEN BRADLEY 0-A16-1',
                Description: 'ALLEN BRADLEY 0-A16undefinedCoil',
                Classification: 'Coil',
                Supplier: 'Unknown',
                Brand: 'ALLEN BRADLEY',
                PartNumber: '0-A16',
                VariationParentSku: undefined,
                allowCreateAp: false,
                IsSerialized: false
            },
            {
                Sku: 'ALLEN BRADLEY 0-A16-2',
                Description: 'ALLEN BRADLEY 0-A16undefinedCoil',
                Classification: 'Coil',
                Supplier: 'Unknown',
                Brand: 'ALLEN BRADLEY',
                PartNumber: '0-A16',
                VariationParentSku: undefined,
                allowCreateAp: false,
                IsSerialized: false
            },
            {
                Sku: 'ALLEN BRADLEY 0-A16-3',
                Description: 'ALLEN BRADLEY 0-A16undefinedCoil',
                Classification: 'Coil',
                Supplier: 'Unknown',
                Brand: 'ALLEN BRADLEY',
                PartNumber: '0-A16',
                VariationParentSku: undefined,
                allowCreateAp: false,
                IsSerialized: false
            },
            {
                Sku: 'ALLEN BRADLEY 0-A16-4',
                Description: 'ALLEN BRADLEY 0-A16undefinedCoil',
                Classification: 'Coil',
                Supplier: 'Unknown',
                Brand: 'ALLEN BRADLEY',
                PartNumber: '0-A16',
                VariationParentSku: undefined,
                allowCreateAp: false,
                IsSerialized: false
            }
        ];
        const formattedData = formatDataForSkuVault(items);
        expect(formattedData).toEqual(expectedData);
    });

    test('should handle items with missing properties', () => {
        const items = [
            {
                "id": 7686,
                "item_name": "ALLEN BRADLEY 0-A16",
                "part_number": "0-A16",
                "brand": "ALLEN BRADLEY",
                "description": "DISCONTINUED BY MANUFACTURER, COIL, 550 VAC, 60 HZ, SCREW TERMINAL",
                "item_category": "COIL",
                "weight": "0.12 lbs",
                "estimated_value": "Not Listed",
                "authorized_distr_brokerage_price": "Not Listed",
                "original_packaging_price": 137,
                "radwell_packaging_price": 119,
                "refurbished_price": 110,
                "repair_price": "Not Listed",
                "last_price_update": "3/17/2021",
                "link": "http://www.radwell.com/Buy/ALLEN%20BRADLEY/ALLEN%20BRADLEY/0-A16",
                "flagged": 0,
                "lister_sku": 1083495,
                "apn": "Not Listed",
                "suggested_category": "COIL",
                "sigma_category": "Coil",
                "sigma_sku": "NULL",
                "sigma_part_number": "NULL",
                "approval_time": "NULL",
                "user_who_approved": "NULL",
                "inventory_sku": 244753,
                "series": "NULL",
                "source": "NULL"
            }
        ];
        const expectedData = [
            {
                Sku: 'ALLEN BRADLEY 0-A16-1',
                Description: 'ALLEN BRADLEY 0-A16NULLCoil',
                Classification: 'Coil',
                Supplier: 'Unknown',
                Brand: 'ALLEN BRADLEY',
                PartNumber: '0-A16',
                VariationParentSku: 244753,
                allowCreateAp: false,
                IsSerialized: false
            },
            {
                Sku: 'ALLEN BRADLEY 0-A16-2',
                Description: 'ALLEN BRADLEY 0-A16NULLCoil',
                Classification: 'Coil',
                Supplier: 'Unknown',
                Brand: 'ALLEN BRADLEY',
                PartNumber: '0-A16',
                VariationParentSku: 244753,
                allowCreateAp: false,
                IsSerialized: false
            },
            {
                Sku: 'ALLEN BRADLEY 0-A16-3',
                Description: 'ALLEN BRADLEY 0-A16NULLCoil',
                Classification: 'Coil',
                Supplier: 'Unknown',
                Brand: 'ALLEN BRADLEY',
                PartNumber: '0-A16',
                VariationParentSku: 244753,
                allowCreateAp: false,
                IsSerialized: false
            },
            {
                Sku: 'ALLEN BRADLEY 0-A16-4',
                Description: 'ALLEN BRADLEY 0-A16NULLCoil',
                Classification: 'Coil',
                Supplier: 'Unknown',
                Brand: 'ALLEN BRADLEY',
                PartNumber: '0-A16',
                VariationParentSku: 244753,
                allowCreateAp: false,
                IsSerialized: false
            }
        ];
        const formattedData = formatDataForSkuVault(items);
        expect(formattedData).toEqual(expectedData);
    });
});




