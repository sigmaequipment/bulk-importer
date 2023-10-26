import requests
import json

#Connection for logging to the importer
Importer_Logging_URL = "http://10.100.100.51:3005/log"

#function the send a message to the import and then print it in the script that called the log function
def logToImporter(message):
    payload = payload = json.dumps({
            "message": message
        }, indent=4, default=str)
    headers = {"Content-Type": "application/json"}
    response = requests.post(url=Importer_Logging_URL, headers=headers, data=payload).json()
    print(response["message"])