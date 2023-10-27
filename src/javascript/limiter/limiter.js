const Bottleneck = require("bottleneck");


function APILimiter (quantity,timeframe = 1,maxConcurrent=5){
    // Time frame will be given in minutes, and we want to convert it to milliseconds.
    timeframe *= 60 * 1000;
    return new Bottleneck({
        reservoir: quantity, // initial value
        reservoirRefreshAmount: quantity,
        reservoirRefreshInterval: timeframe, // must be divisible by 250
        maxConcurrent: maxConcurrent,
    })
}
// FOR TESTING PURPOSES
//
// (async () => {
//     let testLimiter = APILimiter(10,1,5);
//     testLimiter.updateSettings({
//         trackDoneStatus: true
//     })
//     testLimiter.on("received",console.log)
//     testLimiter.on("queued",console.log)
//     testLimiter.on("running",console.log)
//     testLimiter.on("executing",console.log)
//     testLimiter.on("done",({options:{id}})=>{
//         console.log(`Done with ${id}`)
//     })
//
//     let getTransaction = () => fetch("https://app.skuvault.com/api/inventory/getTransactions",{
//         method:"POST",
//         headers:{
//             "Content-Type": "application/json",
//             "Accept": "application/json",
//         },
//         body:JSON.stringify({
//             "ToDate":"2023-08-23T00:00:00.0000000Z",
//             "FromDate":"2023-08-21T00:00:00.0000000Z",
//             "PageNumber": 0,
//             "PageSize": 10000,
//             "TenantToken": "FsoVOQznBeUrR5188WQqkxrt5o8ZE/64OLHY2/LASZE=",
//             "UserToken": "aev/tZ/ZhRsA/h/C8PKpZXR9iTWQDqJ8+Nztj8B3mTc="
//         })
//     })
//     let promises = [];
//     for(let i = 0; i < 1; i++){
//         promises.push(getTransaction)
//     }
//     let responses = await Promise.all(promises.map(promise=>testLimiter.schedule(promise)))
//     responses.forEach(response=> {
//         console.log(response.status)
//         let limit = response.headers.get("X-RateLimit-Limit");
//
//         console.log(limit, remaining)
//     })
//
//
//     // let limit = responseHeaders?.['X-RateLimit-Limit'][0];
//     // let remaining = responseHeaders?.['X-RateLimit-Remaining'][0];
//     // console.log(limit)
//     // console.log(remaining)
//     // let body = await res.json();
//     //console.log(body)
// })()




module.exports = APILimiter