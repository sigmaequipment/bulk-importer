const Bottleneck = require("bottleneck");


module.exports = function APILimiter (quantity,timeframe = 1,maxConcurrent=5){
    // Time frame will be given in minutes, and we want to convert it to milliseconds.
    timeframe *= 60 * 1000;
    return new Bottleneck({
        reservoir: quantity, // initial value
        reservoirRefreshAmount: quantity,
        reservoirRefreshInterval: timeframe, // must be divisible by 250
        maxConcurrent: maxConcurrent,
    })
}