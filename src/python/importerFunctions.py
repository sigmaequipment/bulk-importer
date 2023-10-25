import requests
import json

#connection string for the PostgREST API to access the table needed to import a new item
PostgREST_Table_String = "http://10.100.100.42:8390/approved_templates"

#connection string for the PostgREST API to access the reimport table
reimport_table = "http://10.100.100.42:8390/reimport_needed"

#function to hanlde items that result in a failed import
def uploadFailedImports(failed_skus):
    #init fields for requests to the reimport table
    headers = {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic3VycGx1c191c2VyIn0.mbykDI_CBEDdxyTxqGECh7TwtrRpJPAznPrE291dtww',
        "Content-Type": "application/json"
        }

    #loop through all skus that returned an error, get data on those sku's from the approved table, and add those skus and respective data with that sku to the reimport table
    #TODO add cases for different errors
    for failure in failed_skus:
        current_sku = int(failure["Sku"])
        error_message = f"{failure['FailedAt']}: {failure['ErrorMessage']}"

        print(f'{current_sku} being saved to reimport table')

        sku_query = requests.get(f'{PostgREST_Table_String}?select=item_name,series,source&inventory_sku=eq.{current_sku}').json()

        #TODO handle no response from approved_table
        if (sku_query == []):
            continue

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
        reimport_response = requests.post(url=reimport_table, headers=headers, data=payload)

        print(reimport_response)