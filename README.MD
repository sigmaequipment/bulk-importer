# Bulk Importer Documentation
## Introduction
The current implementation of the importer only allows for single file imports of items.
This is a problem when you have a large number of items to import. This bulk importer
allows you to import multiple items at once, with a maximum of 100 items per import.

---

## references ( links )

[SkuVault API Documentation](https://dev.skuvault.com/reference/additembulk)

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