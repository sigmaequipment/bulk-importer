import json
from datetime import date, datetime
import requests
import threading
import time
from importerErrorHandling import skuErrorHandler, uploadFailedImports, PostgREST_Table_String, Importer_URL, uptime_table, postgres_API_headers
from importerLogging import logToImporter
import traceback
import pytz


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
#function to hanlde the incrementing foward of the sku should an error occur three times in a row
def incrementFromErrorSingle(error_msg):
    
    error_dict = {
        'Sku': None,
        'Error': None
    }

    #make request to get the sku that was being attempeted to be imported
    sku_of_last_import = lastImport["singleSKU"]
    single_import_query_response = requests.get(f'{PostgREST_Table_String}?select=inventory_sku&and=(inventory_sku.gt.{sku_of_last_import},or(source.eq."MANUAL CREATION", source.eq."SERIES GENERATOR"))&order=inventory_sku.asc&limit=1')

    #check status of the response
    if single_import_query_response.status_code != 200:
        error_dict["Error"] = f"Response from db was {single_import_query_response.status_code} when getting sku for error increment"
        return error_dict
    
    #set json from response
    single_import_query = single_import_query_response.json()

    #if the queury returns an empty list wait 30s and then look again for more items
    if single_import_query == [] or single_import_query is None:
        error_dict["Error"] = f"SKU was not found for error increment"
        return error_dict

    #get the item from the query
    item = single_import_query[0]
    error_dict["Sku"] = item["inventory_sku"]

    #dict to send to reimport table
    reimport_list = [{
        "Sku" : str(item["inventory_sku"]),
        "ErrorMessages" : error_msg,
        "FailedAt" : "Single Import Script"
    }]

    #call reimport table function
    reimport = uploadFailedImports(reimport_list, create_brands_bool=False)

    #update sku file
    updateSingleSKUFile(item["inventory_sku"])
    
    return error_dict



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

            #catch for connection errors
            try:

                #query to get the items that need to be imported
                single_import_query_response = requests.get(f'{PostgREST_Table_String}?select=*&and=(inventory_sku.gt.{sku_of_last_import},or(source.eq."MANUAL CREATION", source.eq."SERIES GENERATOR", source.eq."BROAD SCRAPE (NRI)"))&order=inventory_sku.asc&limit=1')

                #check status of the response
                if single_import_query_response.status_code != 200:
                    logToImporter(f"Recieved {single_import_query_response.status_code} when querying DB for items to import. Waiting 60s")
                    time.sleep(60)
                    continue

                #set json from response
                single_import_query = single_import_query_response.json()

                #if the queury returns an empty list wait 30s and then look again for more items
                if single_import_query == [] or single_import_query is None:
                    logToImporter("Single waiting 30 seconds")
                    time.sleep(30)
                    continue

                #get the item from the query
                item = single_import_query[0]

                logToImporter(f"Importing {item['inventory_sku']}")

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

                #save start time for to track uptime
                start_time = datetime.now(pytz.timezone("US/Central"))
                
                #send starttime to DB
                uptime_payload = json.dumps({"inventory_sku" : sku, "start_time" : start_time}, indent=4, default=str)
                uptime_request = requests.post(url=uptime_table, headers=postgres_API_headers, data=uptime_payload)
                
                #get id of time entry that was just created
                uptime_query = (requests.get(f'{uptime_table}?select=id&start_time=eq.{start_time}').json())[0]
                timeID = uptime_query['id']

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

                #save the end time of the request
                end_time = datetime.now(pytz.timezone("US/Central"))

                #get list of skus that returned errors
                importer_request_errors =  importer_request["badSkus"]

                #upload the list of failed skus to the reimport table
                if (importer_request_errors != []):
                    #set item end_time and don't do anything with error boolean, since it is default to true
                    uptime_payload = json.dumps({"end_time" : end_time}, indent=4, default=str)
                    uptime_patch_request = requests.patch(url=f'{uptime_table}?id=eq.{timeID}', headers=postgres_API_headers, data=uptime_payload)

                    logToImporter("There was a error with the import")
                    skuErrorHandler(importer_request_errors, timeID)

                else:
                    #set item end_time and set error boolean to false
                    uptime_payload = json.dumps({"end_time" : end_time, "error" : False}, indent=4, default=str)
                    uptime_patch_request = requests.patch(url=f'{uptime_table}?id=eq.{timeID}', headers=postgres_API_headers, data=uptime_payload)

                    logToImporter("Succesful Import")

                #update the json storing the last imported sku
                updateSingleSKUFile(sku)

            #catch connection error
            except requests.exceptions.ConnectionError as e:
                logToImporter(str(e) + "\nWaiting 60 seconds")
                time.sleep(60)
                continue


#---------------------------------------------------------------------------------------------------------------
#What runs when the script is directly called
if __name__ == "__main__":
    obj = BackgroundTaskSingleImport()
    errorCount = 0
    error_string = ''
    error_sku = 0
    
    #loop to continue running should the import script fail
    while True:
        try:
            obj.getItemsForImport()
        except Exception as ex:
            error_string = ''.join(traceback.TracebackException.from_exception(ex).format())
            logToImporter(error_string)
        
        #increment error count
        errorCount += 1

        #if error count reaches 3 and the same sku errored three times, it gets the sku that was being attempted to be imported, saves it to the reimport table
        if errorCount >= 3 and error_sku == lastImport["singleSKU"]:
            errorCount = 0

            #call function to get sku that failed, send to reimport table, and update sku file
            try:
                error_dict = incrementFromErrorSingle(error_string)
                if (error_dict['Error'] is not None):
                    logToImporter(error_dict['Error'])
            except Exception as ex:
                error_string = ''.join(traceback.TracebackException.from_exception(ex).format())
                logToImporter(error_string)
            
            
        #save sku that failed
        error_sku = lastImport["singleSKU"]

        logToImporter("This is only reached if error was encountered. Sleeping for 60s before restarting importer")
        time.sleep(60)