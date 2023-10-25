const createPromisePool = require('./promisePool');

let sumOfDelay = 0;
async function processor(i) {
    return new Promise((res, rej) => {
        console.log(`[${Date.now()}] Started to process one item. i=${i}`);
        let delay = 150 + Math.random() * 1000;
        sumOfDelay += delay;
        setTimeout(() => {
            console.log(`[${Date.now()}] Processed one item. i=${i} request took : ${delay}ms`);
            res(i);
        }, delay);
    });
}


let pool = createPromisePool(processor, 5)

let promises = Array(1125).fill(0).map((_, i) => i);

const performance = require('perf_hooks').performance;
performance.mark('start');
pool.process(promises)
    .then((results) => {
        console.log(results)
    })
    .finally(()=>{
        performance.mark('end');
        let totalTime = performance.measure('total', 'start', 'end');
        console.log(`Total time: ${totalTime.duration}ms ( ${totalTime.duration/1000}) seconds`);
        console.log(`Average time: ${totalTime.duration/promises.length}ms`);
        console.log(`Sum of delay: ${sumOfDelay}ms`);
        console.log(`That is a time saving of ${sumOfDelay-totalTime.duration}ms`)
        console.log(`This results in a time saving of nearly a factor of ${Math.ceil(sumOfDelay/totalTime.duration)}!`)

    })