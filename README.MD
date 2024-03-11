# Bulk Importer Documentation

## Introduction

The current implementation of the importer only allows for single file imports of items.
This is a problem when you have a large number of items to import. This bulk importer
allows you to import multiple items at once, with a maximum of 125 items per import.
This allows the code base to take full advantage of SkuVault's Throttling limits.
Which is our bottleneck for imports.

---

## references ( links )

[SkuVault API Documentation](https://dev.skuvault.com/reference/createproducts)

[Channel Advisor API Documentation](https://knowledge.channeladvisor.com/kc?id=kb_article_view&sys_kb_id=31ecd7c52fd15994cffb5ff62799b62c)

---

## Description

The API will expose an `/import` end point that accepts a POST request with a JSON body.
The Body will contain an array of items to import, and the tokens required to make the API calls.
If the Items array has only one item, It runs the call through single import route with channel advisor.
This allows us to maintain the same throughput as the old importer for manual creation of items
While allowing for far greater throughput for bulk imports.
The API will then call the SkuVault `/addItemBulk` endpoint, and the Channel Advisor `/ProductUpload` endpoint.
The API will then return a JSON response with the results of the import.

The results in the creation of 125 Sku being created at once.
In SkuVault, this is 500 unique items (Children Sku's).
In Channel Advisor, this is 625 unique items (Parent and Children Sku's).

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
      "item_name": "string",
      "lister_sku": "number",
      "part_number": "string",
      "brand": "string",
      "description": "string",
      "suggested_category": "string",
      "sigma_category": "string",
      "weight": "string",
      "link": "string?<validurl>",
      "apn": "string",
      "series": "string",
      "sigma_old_sku": "string",
      "sigma_old_part_number": "string",
      "estimated_value": "string",
      "authorized_distr_brokerage_price": "string",
      "original_packaging_price": "number", 
      "radwell_packaging_price": "number",
      "refurbished_price": "number",
      "repair_price": "string",
      "last_price_update": "date",
      "flagged": "number",
      "approval_time": "date / timestamp",
      "user_who_approved": "string",
      "inventory_sku": "number",
      "source": "string"
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
      "ErrorMessages": "SKU already exists.\n",
      "FailedAt": "ChannelAdvisorParentImport"
    }
  ],
  "results": []
}
```

---

### Reimport Item

If there was an issue with an item import and a singular SKU needs to be reimported to CA/SV, it can be reimported using the manualImport.py python script. This script can be run from the server that hosts the importer, or from a personal machine that is connected to the VPN and has a venv set up based on the requirements.txt file and activated.
(see https://www.freecodecamp.org/news/how-to-setup-virtual-environments-in-python/ if you need help with that)

Before actually reimporting the item, you need to verify that the SKU has been removed from SKU Vault and Channel Advisor. If there are any images attached to the item on either SV or CA, contact Tyler Applegate so that he can handle the removal of those images. If there is quantity tied to the item in SV, Libby in Surplus will need to be contacted so that Surplus can handle the item before it is removed from SV/CA. Once that SKU has been successfully removed from both sources it can be reimported.

Also before reimporting the SKU, I suggest watching the Importer's log to make sure the importer is waiting while you try to initate a reimport. While I'm not sure if the issue still exists, but there were issues that arose in the past when calling a reimport while the importer was in the process of importing another item

To reimport the SKU, you must run the manualImport.py script from the base directory, while passing it the SKU as a commandline argument (while the virtual environment is active). 

    py ./src/python/maunalImport.py [SKU]

or use

    python3 ./src/python/maunalImport.py [SKU]

Below is an example of what this would look like with SKU 379908:

    (env) ~/bulk-importer$ py ./src/python/maunalImport.py 379908

If successful, the following will be returned
    
    Importing 379908
    Successful Import

If there is an issue from the import, the following will be returned and the item will be added to the reimport_needed table in the postgresql db

    Importing 379908
    There was an error with the import