import json
from datetime import date
import requests
import threading
import time
from importerErrorHandling import skuErrorHandler, PostgREST_Table_String, Importer_URL
from importerLogging import logToImporter
import traceback


#load the user and tenant token json
with open('src/json/SkuVaultTenantandUserTokens.json','r+') as tenant:
    tenanttoken = json.load(tenant)

#load the CA API json
with open('src/json/ChannelAdvisorAPI.json','r+') as channel:
    datachannel = json.load(channel)

#load the SV API json
with open('src/json/SkuVaultAPI.json', 'r+') as skuvaultjson:
    dataskuvault = json.load(skuvaultjson)

#load the last sku that was imported by the bulk import script
with open('src/json/bulkSKU.json', 'r+') as skuFile:
    lastImport = json.load(skuFile)


#---------------------------------------------------------------------------------------------------------------
#modify the file that holds the sku of the last item that was imported via the bulk importer
def updateBulkSKUFile(sku):
    lastImport["bulkSKU"] = sku
    with open('src/json/bulkSKU.json', 'w') as currentSKU:
        json.dump(lastImport, currentSKU)


#---------------------------------------------------------------------------------------------------------------
#Background task to collect non user created items to be sent to the bulk importer
class BackgroundTaskBulkImport(threading.Thread):
    def getItemsForImport(self,*args,**kwargs):
        while True:

            #list to store items that will be part of payload
            items = []

            #list of skus to be imported
            sku_list = []

            #sku of item to be imported
            sku = 0
            
            #sku that was imported last
            sku_of_last_import = lastImport["bulkSKU"]

            #catch for connection errors 
            try:
                #query to get the items that need to be imported
                bulk_import_query_response = requests.get(f'{PostgREST_Table_String}?select=*&and=(inventory_sku.gt.{sku_of_last_import},and(source.not.eq."MANUAL CREATION", source.not.eq."SERIES GENERATOR"))&order=inventory_sku.asc&limit=40')

                #check status of the response 
                if bulk_import_query_response != 200:
                    logToImporter(f"Recieved {bulk_import_query_response.status_code} when querying DB for items to import. Waiting 60s")
                    time.sleep(60)
                    continue

                #set the json response
                bulk_import_query = bulk_import_query_response.json()

                #if the queury returns an empty list wait 30s and then look again for more items
                if bulk_import_query == [] or bulk_import_query is None:
                    logToImporter("Bulk waiting 30 seconds")
                    time.sleep(30)
                    continue
                
                logToImporter(f"Importing {len(bulk_import_query)} items")

                #Loop through all the returned items
                for item in bulk_import_query:

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

                    #append sku to list
                    sku_list.append(item["inventory_sku"])

                    #save sku of item to be saved later
                    sku = item["inventory_sku"]

                logToImporter(f"Importing {sku_list[0]} through {sku_list[(len(sku_list) - 1)]}")

                #set up dictionary for tokens
                tokens = {
                    "clientid": datachannel['clientid'],
                    "clientsecret": datachannel['clientsecret'],
                    "refreshtoken": datachannel['refreshtoken'],
                    "TenantToken": "FsoVOQznBeUrR5188WQqkxrt5o8ZE/64OLHY2/LASZE=",
                    "UserToken": "aev/tZ/ZhRsA/h/C8PKpZXR9iTWQDqJ8+Nztj8B3mTc="
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
                
                #update the json storing the last imported sku
                updateBulkSKUFile(sku)
            
            #catch connection error
            except requests.exceptions.ConnectionError as e:
                logToImporter(str(e) + "\nWaiting 60 seconds")
                time.sleep(60)
                continue


#---------------------------------------------------------------------------------------------------------------
#What runs when the script is directly called
if __name__ == "__main__":
    obj = BackgroundTaskBulkImport()
    while True:
        try:
            obj.getItemsForImport()
        except Exception as ex:
            error_string = ''.join(traceback.TracebackException.from_exception(ex).format())
            logToImporter(error_string)
        
        logToImporter("This is only reached if error was encountered. Sleeping for 60s before restarting importer")
        time.sleep(60)