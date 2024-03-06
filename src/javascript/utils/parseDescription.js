module.exports = (description, expectedKeys) => {
    let temp = description.split("||").slice(1).reduce((acc,curr)=>{
        const [key,value] = curr.split(":");
        acc[key] = value;
        return acc;
    },{})
    return expectedKeys.reduce((acc,curr)=>{
        if(!temp[curr]) temp[curr] = "";
        acc[curr] = temp[curr].trim();
        return acc;
    },{})

}