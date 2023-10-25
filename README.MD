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
* All Responses have (Status and Error Properties)

    * 200
        * Success
    * 202
        * Partial Success
    * 400
        * Bad Request

---

### /Products

* Max Rate Limit 2000 requests per minute
* 1 item per request
* 9 calls per sku
* Theoretical throughput = 222 skus per minute

### Expected Request Body

```json
{
  "items": [
    {
      "item_name": "ALLEN BRADLEY 0-A16",
      "lister_sku": 1083495,
      "part_number": "0-A16",
      "brand": "ALLEN BRADLEY",
      "description": "DISCONTINUED BY MANUFACTURER, COIL, 550 VAC, 60 HZ, SCREW TERMINAL",
      "suggested_category": "COIL",
      "sigma_category": "Coil",
      "weight": "0.12 lbs",
      "link": "http://www.radwell.com/Buy/ALLEN%20BRADLEY/ALLEN%20BRADLEY/0-A16",
      "apn": "Not Listed",
      "series": "NULL",
      "sigma_old_sku": "NULL",
      "sigma_old_part_number": "NULL",
      "estimated_value": "Not Listed",
      "authorized_distr_brokerage_price": "Not Listed",
      "original_packaging_price": 137,
      "radwell_packaging_price": 119,
      "refurbished_price": 110,
      "repair_price": "Not Listed",
      "last_price_update": "3/17/2021",
      "flagged": 0,
      "approval_time": "NULL",
      "user_who_approved": "NULL",
      "inventory_sku": 244753,
      "source": "NULL"
    }
  ],
  "tokens": {
    "clientid": "string",
    "clientsecret": "string",
    "refreshtoken": "string",
    "TenantToken": "string",
    "UserToken": "string"
  }
}

```

### Success Response

```json
{
  "badSkus": [],
  "results": [
  {
  "@odata.context": "https://api.channeladvisor.com/v1/$metadata#Products/$entity",
  "ID": 5998470,
  "ProfileID": 12045347,
  "CreateDateUtc": null,
  "UpdateDateUtc": null,
  "QuantityUpdateDateUtc": null,
  "IsAvailableInStore": null,
  "IsBlocked": null,
  "IsBlockedFromAdvertising": null,
  "IsExternalQuantityBlocked": null,
  "InfiniteQuantity": null,
  "BlockComment": null,
  "BlockedDateUtc": null,
  "BlockedFromAdvertisingDateUtc": null,
  "ReceivedDateUtc": null,
  "LastSaleDateUtc": null,
  "ASIN": null,
  "Brand": "SIEMENS",
  "Condition": null,
  "Description": "STARTER 27AMP 600VAC 220/240V COIL NEMA SIZE1",
  "EAN": null,
  "FlagDescription": null,
  "Flag": "GreenFlag",
  "HarmonizedCode": null,
  "ISBN": null,
  "Manufacturer": null,
  "MPN": "SXL112W",
  "ShortDescription": null,
  "Sku": "520807-3",
  "Subtitle": null,
  "TaxProductCode": null,
  "Title": "SIEMENS SXL112W Motor Starter",
  "UPC": null,
  "WarehouseLocation": null,
  "Warranty": null,
  "MultipackQuantity": null,
  "Height": null,
  "Length": null,
  "Width": null,
  "Weight": 6.62,
  "Cost": null,
  "Margin": null,
  "RetailPrice": 90.99,
  "StartingPrice": null,
  "ReservePrice": null,
  "BuyItNowPrice": null,
  "StorePrice": null,
  "SecondChancePrice": null,
  "MinPrice": null,
  "MaxPrice": null,
  "EstimatedShippingCost": null,
  "SupplierName": null,
  "SupplierCode": null,
  "SupplierPO": null,
  "Classification": "Motor Starter",
  "IsDisplayInStore": null,
  "StoreTitle": null,
  "StoreDescription": null,
  "BundleType": "None",
  "ProductType": "Item",
  "TotalAvailableQuantity": null,
  "OpenAllocatedQuantity": 0,
  "OpenAllocatedQuantityPooled": 0,
  "PendingCheckoutQuantity": 0,
  "PendingCheckoutQuantityPooled": 0,
  "PendingPaymentQuantity": 0,
  "PendingPaymentQuantityPooled": 0,
  "PendingShipmentQuantity": 0,
  "PendingShipmentQuantityPooled": 0,
  "TotalQuantity": null,
  "TotalQuantityPooled": null,
  "QuantitySoldLast7Days": null,
  "QuantitySoldLast14Days": null,
  "QuantitySoldLast30Days": null,
  "QuantitySoldLast60Days": null,
  "QuantitySoldLast90Days": null,
  "IsParent": false,
  "IsInRelationship": true,
  "CopyToChildren": null,
  "CopyToAliases": null,
  "ParentProductID": 5998467,
  "ParentSku": null,
  "RelationshipName": null,
  "VaryBy": null,
  "AliasType": "None",
  "ReferenceSku": null,
  "ReferenceProductID": null
  },

  {
  "@odata.context": "https://api.channeladvisor.com/v1/$metadata#Products/$entity",
  "ID": 5998468,
  "ProfileID": 12045347,
  "CreateDateUtc": null,
  "UpdateDateUtc": null,
  "QuantityUpdateDateUtc": null,
  "IsAvailableInStore": null,
  "IsBlocked": null,
  "IsBlockedFromAdvertising": null,
  "IsExternalQuantityBlocked": null,
  "InfiniteQuantity": null,
  "BlockComment": null,
  "BlockedDateUtc": null,
  "BlockedFromAdvertisingDateUtc": null,
  "ReceivedDateUtc": null,
  "LastSaleDateUtc": null,
  "ASIN": null,
  "Brand": "SIEMENS",
  "Condition": null,
  "Description": "STARTER 27AMP 600VAC 220/240V COIL NEMA SIZE1",
  "EAN": null,
  "FlagDescription": null,
  "Flag": "GreenFlag",
  "HarmonizedCode": null,
  "ISBN": null,
  "Manufacturer": null,
  "MPN": "SXL112W",
  "ShortDescription": null,
  "Sku": "520807-1",
  "Subtitle": null,
  "TaxProductCode": null,
  "Title": "SIEMENS SXL112W Motor Starter",
  "UPC": null,
  "WarehouseLocation": null,
  "Warranty": null,
  "MultipackQuantity": null,
  "Height": null,
  "Length": null,
  "Width": null,
  "Weight": 6.62,
  "Cost": null,
  "Margin": null,
  "RetailPrice": 162.99,
  "StartingPrice": null,
  "ReservePrice": null,
  "BuyItNowPrice": null,
  "StorePrice": null,
  "SecondChancePrice": null,
  "MinPrice": null,
  "MaxPrice": null,
  "EstimatedShippingCost": null,
  "SupplierName": null,
  "SupplierCode": null,
  "SupplierPO": null,
  "Classification": "Motor Starter",
  "IsDisplayInStore": null,
  "StoreTitle": null,
  "StoreDescription": null,
  "BundleType": "None",
  "ProductType": "Item",
  "TotalAvailableQuantity": null,
  "OpenAllocatedQuantity": 0,
  "OpenAllocatedQuantityPooled": 0,
  "PendingCheckoutQuantity": 0,
  "PendingCheckoutQuantityPooled": 0,
  "PendingPaymentQuantity": 0,
  "PendingPaymentQuantityPooled": 0,
  "PendingShipmentQuantity": 0,
  "PendingShipmentQuantityPooled": 0,
  "TotalQuantity": null,
  "TotalQuantityPooled": null,
  "QuantitySoldLast7Days": null,
  "QuantitySoldLast14Days": null,
  "QuantitySoldLast30Days": null,
  "QuantitySoldLast60Days": null,
  "QuantitySoldLast90Days": null,
  "IsParent": false,
  "IsInRelationship": true,
  "CopyToChildren": null,
  "CopyToAliases": null,
  "ParentProductID": 5998467,
  "ParentSku": null,
  "RelationshipName": null,
  "VaryBy": null,
  "AliasType": "None",
  "ReferenceSku": null,
  "ReferenceProductID": null
  },
  {
  "@odata.context": "https://api.channeladvisor.com/v1/$metadata#Products/$entity",
  "ID": 5998471,
  "ProfileID": 12045347,
  "CreateDateUtc": null,
  "UpdateDateUtc": null,
  "QuantityUpdateDateUtc": null,
  "IsAvailableInStore": null,
  "IsBlocked": null,
  "IsBlockedFromAdvertising": null,
  "IsExternalQuantityBlocked": null,
  "InfiniteQuantity": null,
  "BlockComment": null,
  "BlockedDateUtc": null,
  "BlockedFromAdvertisingDateUtc": null,
  "ReceivedDateUtc": null,
  "LastSaleDateUtc": null,
  "ASIN": null,
  "Brand": "SIEMENS",
  "Condition": null,
  "Description": "STARTER 27AMP 600VAC 220/240V COIL NEMA SIZE1",
  "EAN": null,
  "FlagDescription": null,
  "Flag": "GreenFlag",
  "HarmonizedCode": null,
  "ISBN": null,
  "Manufacturer": null,
  "MPN": "SXL112W",
  "ShortDescription": null,
  "Sku": "520807-4",
  "Subtitle": null,
  "TaxProductCode": null,
  "Title": "SIEMENS SXL112W Motor Starter",
  "UPC": null,
  "WarehouseLocation": null,
  "Warranty": null,
  "MultipackQuantity": null,
  "Height": null,
  "Length": null,
  "Width": null,
  "Weight": 6.62,
  "Cost": null,
  "Margin": null,
  "RetailPrice": 60.99,
  "StartingPrice": null,
  "ReservePrice": null,
  "BuyItNowPrice": null,
  "StorePrice": null,
  "SecondChancePrice": null,
  "MinPrice": null,
  "MaxPrice": null,
  "EstimatedShippingCost": null,
  "SupplierName": null,
  "SupplierCode": null,
  "SupplierPO": null,
  "Classification": "Motor Starter",
  "IsDisplayInStore": null,
  "StoreTitle": null,
  "StoreDescription": null,
  "BundleType": "None",
  "ProductType": "Item",
  "TotalAvailableQuantity": null,
  "OpenAllocatedQuantity": 0,
  "OpenAllocatedQuantityPooled": 0,
  "PendingCheckoutQuantity": 0,
  "PendingCheckoutQuantityPooled": 0,
  "PendingPaymentQuantity": 0,
  "PendingPaymentQuantityPooled": 0,
  "PendingShipmentQuantity": 0,
  "PendingShipmentQuantityPooled": 0,
  "TotalQuantity": null,
  "TotalQuantityPooled": null,
  "QuantitySoldLast7Days": null,
  "QuantitySoldLast14Days": null,
  "QuantitySoldLast30Days": null,
  "QuantitySoldLast60Days": null,
  "QuantitySoldLast90Days": null,
  "IsParent": false,
  "IsInRelationship": true,
  "CopyToChildren": null,
  "CopyToAliases": null,
  "ParentProductID": 5998467,
  "ParentSku": null,
  "RelationshipName": null,
  "VaryBy": null,
  "AliasType": "None",
  "ReferenceSku": null,
  "ReferenceProductID": null
  },
  {
  "@odata.context": "https://api.channeladvisor.com/v1/$metadata#Products/$entity",
  "ID": 5998469,
  "ProfileID": 12045347,
  "CreateDateUtc": null,
  "UpdateDateUtc": null,
  "QuantityUpdateDateUtc": null,
  "IsAvailableInStore": null,
  "IsBlocked": null,
  "IsBlockedFromAdvertising": null,
  "IsExternalQuantityBlocked": null,
  "InfiniteQuantity": null,
  "BlockComment": null,
  "BlockedDateUtc": null,
  "BlockedFromAdvertisingDateUtc": null,
  "ReceivedDateUtc": null,
  "LastSaleDateUtc": null,
  "ASIN": null,
  "Brand": "SIEMENS",
  "Condition": null,
  "Description": "STARTER 27AMP 600VAC 220/240V COIL NEMA SIZE1",
  "EAN": null,
  "FlagDescription": null,
  "Flag": "GreenFlag",
  "HarmonizedCode": null,
  "ISBN": null,
  "Manufacturer": null,
  "MPN": "SXL112W",
  "ShortDescription": null,
  "Sku": "520807-2",
  "Subtitle": null,
  "TaxProductCode": null,
  "Title": "SIEMENS SXL112W Motor Starter",
  "UPC": null,
  "WarehouseLocation": null,
  "Warranty": null,
  "MultipackQuantity": null,
  "Height": null,
  "Length": null,
  "Width": null,
  "Weight": 6.62,
  "Cost": null,
  "Margin": null,
  "RetailPrice": 124.99,
  "StartingPrice": null,
  "ReservePrice": null,
  "BuyItNowPrice": null,
  "StorePrice": null,
  "SecondChancePrice": null,
  "MinPrice": null,
  "MaxPrice": null,
  "EstimatedShippingCost": null,
  "SupplierName": null,
  "SupplierCode": null,
  "SupplierPO": null,
  "Classification": "Motor Starter",
  "IsDisplayInStore": null,
  "StoreTitle": null,
  "StoreDescription": null,
  "BundleType": "None",
  "ProductType": "Item",
  "TotalAvailableQuantity": null,
  "OpenAllocatedQuantity": 0,
  "OpenAllocatedQuantityPooled": 0,
  "PendingCheckoutQuantity": 0,
  "PendingCheckoutQuantityPooled": 0,
  "PendingPaymentQuantity": 0,
  "PendingPaymentQuantityPooled": 0,
  "PendingShipmentQuantity": 0,
  "PendingShipmentQuantityPooled": 0,
  "TotalQuantity": null,
  "TotalQuantityPooled": null,
  "QuantitySoldLast7Days": null,
  "QuantitySoldLast14Days": null,
  "QuantitySoldLast30Days": null,
  "QuantitySoldLast60Days": null,
  "QuantitySoldLast90Days": null,
  "IsParent": false,
  "IsInRelationship": true,
  "CopyToChildren": null,
  "CopyToAliases": null,
  "ParentProductID": 5998467,
  "ParentSku": null,
  "RelationshipName": null,
  "VaryBy": null,
  "AliasType": "None",
  "ReferenceSku": null,
  "ReferenceProductID": null
  },
  {
  "@odata.context": "https://api.channeladvisor.com/v1/$metadata#Products/$entity",
  "ID": 5998467,
  "ProfileID": 12045347,
  "CreateDateUtc": null,
  "UpdateDateUtc": null,
  "QuantityUpdateDateUtc": null,
  "IsAvailableInStore": null,
  "IsBlocked": null,
  "IsBlockedFromAdvertising": null,
  "IsExternalQuantityBlocked": null,
  "InfiniteQuantity": null,
  "BlockComment": null,
  "BlockedDateUtc": null,
  "BlockedFromAdvertisingDateUtc": null,
  "ReceivedDateUtc": null,
  "LastSaleDateUtc": null,
  "ASIN": null,
  "Brand": "SIEMENS",
  "Condition": null,
  "Description": "STARTER 27AMP 600VAC 220/240V COIL NEMA SIZE1",
  "EAN": null,
  "FlagDescription": null,
  "Flag": "GreenFlag",
  "HarmonizedCode": null,
  "ISBN": null,
  "Manufacturer": null,
  "MPN": "SXL112W",
  "ShortDescription": null,
  "Sku": "520807",
  "Subtitle": null,
  "TaxProductCode": null,
  "Title": "SIEMENS SXL112W Motor Starter",
  "UPC": null,
  "WarehouseLocation": null,
  "Warranty": null,
  "MultipackQuantity": null,
  "Height": null,
  "Length": null,
  "Width": null,
  "Weight": 6.62,
  "Cost": null,
  "Margin": null,
  "RetailPrice": null,
  "StartingPrice": null,
  "ReservePrice": null,
  "BuyItNowPrice": null,
  "StorePrice": null,
  "SecondChancePrice": null,
  "MinPrice": null,
  "MaxPrice": null,
  "EstimatedShippingCost": null,
  "SupplierName": null,
  "SupplierCode": null,
  "SupplierPO": null,
  "Classification": "Motor Starter",
  "IsDisplayInStore": null,
  "StoreTitle": null,
  "StoreDescription": null,
  "BundleType": "None",
  "ProductType": "Item",
  "TotalAvailableQuantity": null,
  "OpenAllocatedQuantity": 0,
  "OpenAllocatedQuantityPooled": 0,
  "PendingCheckoutQuantity": 0,
  "PendingCheckoutQuantityPooled": 0,
  "PendingPaymentQuantity": 0,
  "PendingPaymentQuantityPooled": 0,
  "PendingShipmentQuantity": 0,
  "PendingShipmentQuantityPooled": 0,
  "TotalQuantity": null,
  "TotalQuantityPooled": null,
  "QuantitySoldLast7Days": null,
  "QuantitySoldLast14Days": null,
  "QuantitySoldLast30Days": null,
  "QuantitySoldLast60Days": null,
  "QuantitySoldLast90Days": null,
  "IsParent": true,
  "IsInRelationship": true,
  "CopyToChildren": null,
  "CopyToAliases": null,
  "ParentProductID": null,
  "ParentSku": null,
  "RelationshipName": null,
  "VaryBy": null,
  "AliasType": "None",
  "ReferenceSku": null,
  "ReferenceProductID": null
  }
]
}

```

### Failure Response

```json
{
  "badSkus": [
    {
      "Sku": "520807",
      "ErrorMessage": "SKU already exists.\n",
      "FailedAt": "ChannelAdvisorParentImport"
    }
  ],
  "results": []
}
```