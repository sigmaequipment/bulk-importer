import requests
import json
from importerLogging import logToImporter

#connection string for the PostgREST API to access the table needed to import a new item
PostgREST_Table_String = "http://10.100.100.42:8390/approved_templates"

#connection string for the PostgREST API to access the reimport table
reimport_table = "http://10.100.100.42:8390/reimport_needed"

#Connection string to the JS importer
Importer_URL = "http://10.100.100.51:3005/import"

#load the user and tenant token json
with open('src/json/SkuVaultTenantandUserTokens.json','r+') as tenant:
    tenanttoken = json.load(tenant)

#load the CA API json
with open('src/json/ChannelAdvisorAPI.json','r+') as channel:
    datachannel = json.load(channel)


#---------------------------------------------------------------------------------------------------------------
#function to call all of the needed functions to hanlde errors from imports
def skuErrorHandler(failed_skus):
    #save skus that failed original import to the reimport table and return skus that need a brand created
    brand_reimport_list = uploadFailedImports(failed_skus, create_brands_bool=True)

    #logToImporter(f"brand list: {brand_reimport_list}")

    if (brand_reimport_list != []):
        #create brands in SV
        createBrands(brand_reimport_list)

        #reimport items that failed due to brands not being created, returns list of erros
        errors = importFailedBrandItems(brand_reimport_list)

        if (errors != []):
            #save skus that failed the reimport to the reimport table and will NOT return list of skus that need brands created
            save_reimport_failures = uploadFailedImports(errors, create_brands_bool=False)


#---------------------------------------------------------------------------------------------------------------
#function to hanlde items that result in a failed import
def uploadFailedImports(failed_skus, create_brands_bool):
    #init fields for requests to the reimport table
    headers = {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic3VycGx1c191c2VyIn0.mbykDI_CBEDdxyTxqGECh7TwtrRpJPAznPrE291dtww',
        "Content-Type": "application/json"
        }

    #init lists to store skus of items that were saved and items that need brands created    
    saved_sku_list = []
    brand_reimport_list = []

    #loop through all skus that returned an error, get data on those sku's from the approved table, and add those skus and respective data with that sku to the reimport table
    for failure in failed_skus:
        current_sku = int((failure["Sku"]).split('-')[0])
        message_string = "".join(failure['ErrorMessages'])
        error_message = f"{failure['FailedAt']}: {message_string}"

        #catch items that failed due to invalid brand
        if ("Invalid Brand" in message_string and create_brands_bool is True):
            if (current_sku not in brand_reimport_list):
                brand_reimport_list.append(current_sku)
            continue

        #Error has already been saved
        if (current_sku in saved_sku_list):
            continue

        logToImporter(f"{current_sku} failed its import")

        #get data on the sku to be saved
        sku_query = requests.get(f'{PostgREST_Table_String}?select=item_name,series,source&inventory_sku=eq.{current_sku}').json()

        if (sku_query == []):
            logToImporter(f"{current_sku} not being saved to reimport table")
            continue

        logToImporter(f'{current_sku} being saved to reimport table')

        #init item for reimport table
        current_item = sku_query[0]
        payload = json.dumps({
            "inventory_sku": current_sku,
            "item_name": current_item["item_name"],
            "series": current_item["series"],
            "source": current_item["source"],
            "error_message": error_message
        }, indent=4, default=str)

        #post to API
        reimport_table_response = requests.post(url=reimport_table, headers=headers, data=payload)

        logToImporter(f"Reimport table response: {reimport_table_response}")

        saved_sku_list.append(current_sku)
    
    return brand_reimport_list


#---------------------------------------------------------------------------------------------------------------
#function to handle the creation of a brand within SV
def createBrands(sku_list):
    
    #list of brands that have been successfully created
    created_brand_list = []
    
    #loop through skus in list, get that item's brand, and attempt to create that brand in SV
    for sku in sku_list:
        sku_query = requests.get(f'{PostgREST_Table_String}?select=brand,user_who_approved&inventory_sku=eq.{sku}').json()[0]
    
        #brand was recently created
        if (sku_query['brand'] in created_brand_list):
            continue

        #init content for SV brand creation call
        brandURL = "https://app.skuvault.com/api/products/createBrands"
        headers = {"Content-Type": "application/json", "Accept": "application/json"}
        payload = json.dumps({
            "Brands": {"Name": f"{sku_query['brand']}"},
            "TenantToken": tenanttoken[sku_query["user_who_approved"]]["TenantToken"],
            "UserToken": tenanttoken[sku_query["user_who_approved"]]["UserToken"]
        }, indent=4, default=str)

        logToImporter(f"Creating Brand: {sku_query['brand']}")

        #make request to create brand
        response = requests.post(brandURL, data=payload, headers=headers)
        
        logToImporter(f"Create brand response: {response.json()}")
        
        #brand successfully created
        if (response.status_code == 200):
            created_brand_list.append(sku_query['brand'])

            logToImporter(f"Added {sku_query['brand']} to brands in SKUvault")


#---------------------------------------------------------------------------------------------------------------
#function to send an import request to the importer with data from the items that had to have a brand created
def importFailedBrandItems(sku_list):
    
    #list to store items that will be part of payload
    items = []

    #list of skus that are going to be reimported
    sku_list = []

    #loop through every sku that needs to be reimported
    for sku in sku_list:
        sku_query = requests.get(f'{PostgREST_Table_String}?select=*&inventory_sku=eq.{sku}').json()

        if (sku_query ==[]):
            continue

        item = sku_query[0]

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

        #append sku to sku list
        sku_list.append(item['inventory_sku'])

    logToImporter(f"Reimporting {sku_list}")

    #tokens if there are more than one item to be imported, uses "BSA" credentials
    if (len(items) > 1):
        tokens = {
            "clientid": datachannel['clientid'],
            "clientsecret": datachannel['clientsecret'],
            "refreshtoken": datachannel['refreshtoken'],
            "TenantToken": "FsoVOQznBeUrR5188WQqkxrt5o8ZE/64OLHY2/LASZE=",
            "UserToken": "aev/tZ/ZhRsA/h/C8PKpZXR9iTWQDqJ8+Nztj8B3mTc="
        }
    #tokens if only one item is being imported, uses the credentials of the 
    else:
        tokens = {
            "clientid": datachannel['clientid'],
            "clientsecret": datachannel['clientsecret'],
            "refreshtoken": datachannel['refreshtoken'],
            "TenantToken": tenanttoken[items[0]["user_who_approved"]]["TenantToken"],
            "UserToken": tenanttoken[items[0]["user_who_approved"]]["UserToken"]
        }

    #set up payload to be sent to API 
    payload = json.dumps({"items" : items, "tokens" : tokens}, indent=4, default=str)

    #send request to Michael's endpoint
    headers = {"Content-Type": "application/json"}
    importer_request = requests.post(url=Importer_URL, headers=headers, data=payload, timeout=None).json()

    #return errors
    return importer_request["badSkus"]
