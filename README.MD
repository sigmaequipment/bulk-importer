# Bulk Importer Documentation
## Introduction
The current implementation of the importer only allows for single file imports of items.
This is a problem when you have a large number of items to import. This bulk importer
allows you to import multiple items at once, with a maximum of 500 items per import.

---

## references ( links )

[SkuVault API Documentation](https://dev.skuvault.com/reference/createproducts)

[Channel Advisor API Documentation](https://knowledge.channeladvisor.com/kc?id=kb_article_view&sys_kb_id=31ecd7c52fd15994cffb5ff62799b62c)

---

## Description

The API will expose an `/importProductBulk` end point that accepts a POST request with a JSON body.
This body must contain a list of sku's, and all the necessary tokens for SkuVault and Channel Advisor.
The API will then call the SkuVault `/addItemBulk` endpoint, and the Channel Advisor `/ProductUpload` endpoint.
The API will then return a JSON response with the results of the import.

## Token Requirements

### Channel Advisor
* APPLICATION_ID
* SHARED_SECRET
* REFRESH_TOKEN

### SkuVault
* USER_TOKEN
* TENANT_TOKEN

---

## API Endpoints Notes

### /createProducts
* Heavy Throttling
    * 5 requests per minute
* 100 items per request
* Body (Bold are required)
  * Items
    * **Sku**
    * Description
    * Short Description
    * Long Description
    * **Classification**
    * **Supplier**
    * **Brand**
    * Code
    * PartNumber
    * Cost
    * Sale Price
    * Retail Price
    * Weight
    * WeightUnit
    * VariationParentSku
    * ReorderPoint
    * MinimumOrderQuantity
    * MinimumOrderQuantityInfo
    * Note
    * Statuses
    * Pictures
    * AllowCreateAp
    * SupplierInfo
    * IsSerialized
    * Client
    * IsLotted
    * LotPriority
  * **Tenant Token**
  * **User Token**
* Responses all have (Status and Error Properties)

  * 200
    * Success
  * 202
    * Partial Success
  * 400
    * Bad Request

---



### /ProductUpload
* max rate limit is 60 files per hour
* max file size is 128MB
* That works out to roughly one request per minute.


### Expected Request Body

```json
{   
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
    ],
    "tokens":{
        "clientid": "string",
        "clientsecret": "string",
        "refreshtoken": "string",
        "TenantToken": "string",
        "UserToken": "string"
    }
}

```