const categoryFlags = require("../../json/CategoryColors.json")
const calculatePrices = require("../calculatePrice/calculatePrice");
const {childrenFactory} = require("../createChildrenFactory/createChildrenFactory");
const entities = {
    "&amp;" : "&",
    "&#38;" : "&",
    "&#37;" : "%",
    "&#58;" : ":",
    "&#59;" : ";",
    "&#43;" : "+",
    "&#45;" : "-",
    "&#61;" : "=",
    "&#190;" : "¾",
    "&frac34;" : "¾",
    "&#40;" : "(",
    "&#41;" : ")",
    "&#39;" : "'",
    "&ldquo;" : "\"",
    "&#8220;" : "\"",
    "&rdquo;" : "\"",
    "&quot;" : "\"",
    "&#42;" : "*",
    "&#46;" : ".",
    "&#44;" : ",",
    "&#47;" : "/",
    "&#92;" : "\\",
    "&#33;" : "!",
    "&#95;" : "_",
    "oslash" : "Ø",
    "&alpha;" : "α",
    "&Omega;" : "Ω",
    "&theta;" : "θ",
    "&omega;" : "ω",
    "&micro;" : "µ",
    "&nbsp;" : " ",
    "&deg;" : "°"
};

function formatWeight(weight){
    if(weight === undefined || weight === null || weight === '') return null;
    let isPounds = weight.includes("lbs");
    weight = Number(weight.split(" ")[0]);
    if(isPounds){
        return weight;
    }
    return Math.ceil(toPrecision(weight * 2.20462,2));
}
function formatSeries (series) {
    return`${series ? `Ser. ${series} ` : " "}`
}
function toPrecision (num, precision) {
    return num.toPrecision(precision);
}

function transformHTMLEntities(str){
    let regex = new RegExp(Object.keys(entities).join("|"),"gi");
    return str.replace(regex, (match) => entities[match]);
}
function formatItem(item){
    let ProfileID = 12045347;
    let {
        item_name, sigma_category, original_packaging_price,
        radwell_packaging_price, refurbished_price,
        inventory_sku, brand, part_number, weight,
        user_who_approved, sigma_old_sku, apn, series
    } = item;

    weight = formatWeight(weight);
    let itemSeries = formatSeries(series);
    let itemTitle = `${item_name}${itemSeries}${sigma_category === "Other" ? "" : sigma_category}`;

    let prices = [original_packaging_price,radwell_packaging_price,refurbished_price,refurbished_price].map((price,i) => {
        return price !== null ? Math.ceil(calculatePrices(i + 1,price)) - .01 : null;
    })

    let categoryFlag = sigma_category === "Other" ? "NoFlag" : categoryFlags[sigma_category];
    let parent = {
        ProfileID,
        Sku:String(inventory_sku),
        Title:transformHTMLEntities(itemTitle),
        IsParent: true,
        IsInRelationship: true,
        Brand:transformHTMLEntities(brand),
        MPN:transformHTMLEntities(part_number),
        Description:transformHTMLEntities(item.description),
        Weight:weight,
        Flag: categoryFlag,
        Classification:sigma_category,
        Attributes: [
            {
                "Name": "(01.) Manufacturer",
                "Value": brand
            },
            {
                "Name": "(02.) Model",
                "Value":  part_number
            },
            {
                "Name" : "(07.) Pre-Approved By",
                "Value" : user_who_approved
            },{
                "Name" : "Legacy SKUs",
                "Value" : sigma_old_sku
            },{
                "Name" : "Alternate Model Number",
                "Value" : apn
            }, {
                "Name" : "(09.) Series: Allen-Bradley Only",
                "Value" : series
            },
        ]
    }
    let createChild = childrenFactory(parent,item);
    return [parent,...prices.map((price,i) => createChild(price,i))]
}

module.exports = formatItem