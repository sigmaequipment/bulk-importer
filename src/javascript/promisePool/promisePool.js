const {PromisePool} = require('@supercharge/promise-pool');

function createPromisePool (promiseGenerator,concurrency=10) {
    return {
        process:(promises)=>PromisePool
            .for(promises)
            .withConcurrency(concurrency)
            .process(promiseGenerator)
    };
}

module.exports = createPromisePool;


