const assert = require('assert');

module.exports = function splitPayload(payload){
    assert(payload.length <= 500);
    let payloadChunks = [];
    let chunk = [];
    payload.forEach((item,i)=>{
        chunk.push(item);
        if((i + 1) % 100 === 0){
            payloadChunks.push(chunk);
            chunk = [];
        }
    })
    payloadChunks.push(chunk);
    payloadChunks = payloadChunks.filter(chunk=>chunk.length !== 0)
    assert(payloadChunks.length <= 5);
    assert(payloadChunks.every(chunk=>chunk.length <= 100));
    return payloadChunks;
}