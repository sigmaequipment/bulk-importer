from csv import writer
import json
import sys


print('First param:'+sys.argv[1]+'#')
with open("src\json\specialcharacters.json") as special:
    dataspecial = json.load(special)

with open('src\json\CategoryColors.json', 'r+') as categorycolors:
    datacolors = json.load(categorycolors)

with open(sys.argv[1],'r+') as datarows:
    dbrows = json.load(datarows)


def append(rows):
# This assumes that the rows will be dictionaries.
    for row in rows:
        id = row['id']
        item_name = row['item_name']
        part_number = row['part_number']
        brand = row['brand']
        description = row['description']
        item_category = row['item_category']
        weight =  row['weight']
        estimated_value = row['estimated_value']
        authorized_distr_brokerage_price = row['authorized_distr_brokerage_price']
        original_packaging_price = row['original_packaging_price']
        radwell_packaging_price = row['radwell_packaging_price']
        refurbished_price = row['refurbished_price']
        repair_price = row['repair_price']
        last_price_update = row['last_price_update']
        link = row['link']
        flagged = row['flagged']
        lister_sku =  row['lister_sku']
        apn =  row['apn']
        suggested_category = row['suggested_category']
        sigma_category =  row['sigma_category']
        sigma_sku =  row['sigma_sku']
        sigma_part_number = row['sigma_part_number']
        approval_time = row['approval_time']
        user_who_approved = row['user_who_approved']
        inventory_sku = str(row['inventory_sku'])


        sigmacategory = str(sigma_category).upper()

        conditions = ["Never Used - Original Packaging", "Never Used - SIGMA Packaging","SIGMA Certified Refurbished","Used"]

        if brand == "ALLEN BRADLEY":
            allenbradleyseries = " Ser. " + str(row['series'])
        else:
            allenbradleyseries = ""


        category = sigma_category
        categoryflag = datacolors[category]

        itemname = str(item_name)
        partnumber = str(part_number)
        brand = str(brand)
        description = str(description)
        apn = str(apn)

        if "," in apn:
            apnafter = apn.replace(",", " ")
            apn = apnafter

        for character in dataspecial:
            itemnameafter = itemname.replace(character, dataspecial[character])
            itemname = itemnameafter
            partnumberafter = partnumber.replace(character, dataspecial[character])
            partnumber = partnumberafter
            brandafter = brand.replace(character, dataspecial[character])
            brand = brandafter
            descriptionafter = description.replace(character, dataspecial[character])
            description = descriptionafter
            apnafter = apn.replace(character, dataspecial[character])
            apn = apnafter

        counting = 1

        descriptionsss = description
        addstringdescription = descriptionsss
        newdescription = addstringdescription.replace(",","\n,")
        ParentList = [
            f"{itemname} {allenbradleyseries} {sigmacategory}",
            inventory_sku,
            '','','','','','','','','','','','','','','',
            part_number,
            "",
            newdescription,
            brand,
            brand,
            '',
            '',
            categoryflag,
            '','','','','','','','','','',
            '','','','','','','PARENT','',"Never Used - Original Packaging, Never Used - SIGMA Packaging, SIGMA Certified Repaired and Tested, Previously Used - Untested",'','','',
            sigma_category,
            "(01.) Manufacturer",
            brand,
            "(02.) Model",
            part_number,
            "Legacy SKUs",
            sigma_sku,
            "Alternate Model Number",
            apn,
            "(07.) Pre-Approved By",
            user_who_approved
        ]
        with open('ChannelAdvisorP1.csv', 'a', encoding="utf-8") as f_object:
            # Pass this file object to csv.writer()
            # and get a writer object
            writer_object = writer(f_object, delimiter="|",)
            # Pass the list as an argument into
            # the writerow()
            writer_object.writerow(ParentList)
            # Close the file object
            f_object.close()

        price = [original_packaging_price,radwell_packaging_price,refurbished_price,""]
        while counting <= 4:
            for condition in conditions:
                List = [
                    f"",
                    f"{inventory_sku}-{counting}",
                    '','','','','','','','','','','','','','','',
                    part_number,
                    "",
                    newdescription,
                    brand,
                    brand,
                    '',
                    '',
                    categoryflag,
                    '','','','','','','','','','',
                    '','','','','','',
                    inventory_sku,
                    '','','','','',
                    sigma_category,
                    "(01.) Manufacturer",
                    brand,
                    "(02.) Model",
                    part_number,
                    "(03.) Condition",
                    condition,
                    "Legacy SKUs",
                    sigma_sku,
                    "Suggested Market Value",
                    price[counting-1],
                    "Alternate Model Number",
                    apn,
                    "(07.) Pre-Approved By",
                    user_who_approved
                ]
                with open('ChannelAdvisorP1.csv', 'a', encoding="utf-8") as f_object:
                    # Pass this file object to csv.writer()
                    # and get a writer object
                    writer_object = writer(f_object, delimiter="|")
                    # Pass the list as an argument into
                    # the writerow()
                    writer_object.writerow(List)
                    # Close the file object
                    f_object.close()

                counting = counting + 1

append(dbrows)
