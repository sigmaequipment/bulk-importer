import json
import requests
import sys
from importerErrorHandling import skuErrorHandler, PostgREST_Table_String, Importer_URL
from importerLogging import logToImporter

#load the user and tenant token json
with open('src/json/SkuVaultTenantandUserTokens.json','r+') as tenant:
    tenanttoken = json.load(tenant)

#load the CA API json
with open('src/json/ChannelAdvisorAPI.json','r+') as channel:
    datachannel = json.load(channel)

#load the SV API json
with open('src/json/SkuVaultAPI.json', 'r+') as skuvaultjson:
    dataskuvault = json.load(skuvaultjson)

#---------------------------------------------------------------------------------------------------------------
#function to send an import request to the importer 
def importFailedBrandItems(sku):

    #list to store items that will be part of payload
    items = []

    sku_query = requests.get(f'{PostgREST_Table_String}?select=*&inventory_sku=eq.{sku}').json()

    if (sku_query == []):
        logToImporter(f"SKU: {sku} did not exist. Returning")
        return
    
    item = sku_query[0]

    logToImporter(f"Importing {sku}")

    #convert data from query to dictionary
    item_to_dictionary = {
        "inventory_sku" : item["inventory_sku"],
        "item_name" : item["item_name"],
        "lister_sku" : item["lister_sku"],
        "part_number" : item["part_number"],
        "brand" : item["brand"],
        "description" : item["description"],
        "suggested_category" : item["suggested_category"],
        "sigma_category" : item["sigma_category"],
        "weight" : item["weight"],
        "link" : item["link"],
        "apn" : item["apn"],
        "series" : item["series"],
        "sigma_old_sku" : item["sigma_old_sku"],
        "sigma_old_part_number" : item["sigma_old_part_number"],
        "estimated_value" : item["estimated_value"],
        "authorized_distr_brokerage_price" : item["authorized_distr_brokerage_price"],
        "original_packaging_price" : item["original_packaging_price"],
        "radwell_packaging_price" : item["radwell_packaging_price"],
        "refurbished_price" : item["refurbished_price"],
        "repair_price" : item["repair_price"],
        "last_price_update" : item["last_price_update"],
        "scrape_time" : item["scrape_time"],
        "approval_time" : item["approval_time"],
        "user_who_approved" : item["user_who_approved"],
        "source" : item["source"],
    }

    #append item to list
    items.append(item_to_dictionary)

    #set up dictionary for tokens
    tokens = {
        "clientid": datachannel['clientid'],
        "clientsecret": datachannel['clientsecret'],
        "refreshtoken": datachannel['refreshtoken'],
        "TenantToken": tenanttoken[item["user_who_approved"]]["TenantToken"],
        "UserToken": tenanttoken[item["user_who_approved"]]["UserToken"]
    }

    #set up payload to be sent to API 
    payload = json.dumps({"items" : items, "tokens" : tokens}, indent=4, default=str)

     #send request to Michael's endpoint
    headers = {"Content-Type": "application/json"}
    importer_request = requests.post(url=Importer_URL, headers=headers, data=payload, timeout=None).json()

    #get list of skus that returned errors
    importer_request_errors =  importer_request["badSkus"]

    #upload the list of failed skus to the reimport table
    if (importer_request_errors != []):
        logToImporter("There was a error with the import")
        skuErrorHandler(importer_request_errors)

    else:
        logToImporter("Succesful Import")




#---------------------------------------------------------------------------------------------------------------
#What runs when the script is directly called
#called by supplying the sku as a command line arguement
if __name__ == "__main__":
    importFailedBrandItems(sys.argv[1])