const conditionsMap = {
    1: "Never Used - Original Packaging",
    2: "Never Used - SIGMA Packaging",
    3: "SIGMA Certified Refurbished",
    4: "Used"
}
function childrenFactory(parent,item){
    const{inventory_sku,original_packaging_price,radwell_packaging_price,refurbished_price} = item;
    return function createChild(price,condition){
        condition += 1;
        let tempChild = JSON.parse(JSON.stringify(parent));
        tempChild.IsParent = false;
        tempChild.Sku = inventory_sku + "-" + condition;
        //todo add parentProductID
        tempChild.RetailPrice = price;
        tempChild.Attributes.push(...[
            {
                "Name": "(03.) Condition",
                "Value": conditionsMap[condition]
            },
            {
                "Name": "Randa's Automated Price",
                "Value": `${price}`
            },
            {
                "Name" : "Market Price: SIGMA Packaging",
                "Value" : radwell_packaging_price
            },
            {
                "Name" : "Market Price: Refurbished",
                "Value" : refurbished_price
            },
            {
                "Name" : "Market Price: Original Packaging",
                "Value" : original_packaging_price
            }
        ])
        return tempChild;

    }
}

module.exports = {
    childrenFactory,
    conditionsMap
}