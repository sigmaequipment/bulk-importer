import json
from datetime import date
import requests
import threading
import time
from importerErrorHandling import skuErrorHandler


#connection string for the PostgREST API to access the table needed to import a new item
PostgREST_Table_String = "http://10.100.100.42:8390/approved_templates"

#Connection string to the JS importer
Importer_URL = "http://10.100.100.51:3005/import"

#load the user and tenant token json
with open('src/json/SkuVaultTenantandUserTokens.json','r+') as tenant:
    tenanttoken = json.load(tenant)

#load the CA API json
with open('src/json/ChannelAdvisorAPI.json','r+') as channel:
    datachannel = json.load(channel)

#load the SV API json
with open('src/json/SkuVaultAPI.json', 'r+') as skuvaultjson:
    dataskuvault = json.load(skuvaultjson)

#load the last sku that was imported by the single import script
with open('src/json/singleSKU.json', 'r+') as skuFile:
    lastImport = json.load(skuFile)


#---------------------------------------------------------------------------------------------------------------
#modify the file that holds the sku of the last item that was imported via the single importer
def updateSingleSKUFile(sku):
    lastImport["singleSKU"] = sku
    with open('src/json/singleSKU.json', 'w') as currentSKU:
        json.dump(lastImport, currentSKU)


#---------------------------------------------------------------------------------------------------------------
#Background task to collect non user created items to be sent to the single importer
class BackgroundTaskSingleImport(threading.Thread):
    def getItemsForImport(self,*args,**kwargs):
        while True:

            #list to store items that will be part of payload
            items = []
            
            #sku of item to be imported
            sku = 0
            
            #sku that was imported last
            sku_of_last_import = lastImport["singleSKU"]

            #query to get the items that need to be imported
            single_import_query = requests.get(f'{PostgREST_Table_String}?select=*&and=(inventory_sku.gt.{sku_of_last_import},or(source.eq."MANUAL CREATION", source.eq."SERIES GENERATOR"))&order=inventory_sku.asc&limit=1').json()

            #if the queury returns an empty list wait 30s and then look again for more items
            if single_import_query == []:
                print("Waiting 30 seconds")
                time.sleep(30)
                continue

            #get the item from the query
            item = single_import_query[0]

            print(f"Importing {item['inventory_sku']}")

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

            #save sku of item to be saved later
            sku = item["inventory_sku"]

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
            
            print(f"{importer_request}")

            #get list of skus that returned errors
            importer_request_errors =  importer_request["badSkus"]

            #upload the list of failed skus to the reimport table
            if (importer_request_errors != []):
                skuErrorHandler(importer_request_errors)

            #update the json storing the last imported sku
            updateSingleSKUFile(sku)


#---------------------------------------------------------------------------------------------------------------
#What runs when the script is directly called
if __name__ == "__main__":
    obj = BackgroundTaskSingleImport()
    obj.getItemsForImport()