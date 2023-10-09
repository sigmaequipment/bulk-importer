const Fastify = require('fastify');
const {spawn} = require('child_process');
const fs = require("fs");
const fastify = Fastify({
    logger: true
});
function usePython(rows) {
    let dataToSend;
    return new Promise((resolve, reject) => {
        const python = spawn('python', ['src/python/formatRequestForChannelAdvisor.py','src/json/temp/temp.json']);
        python.stdout.on('data', function (data) {
            console.log('Pipe data from python script ...');
            dataToSend = data.toString();
        })
        python.on('error',reject)
        python.on('close', (code) => {
            console.log(`child process close all stdio with code ${code}`);
            resolve(dataToSend);
        });
    })
}

async function createTempJSONFile(rows) {
    await new Promise((resolve, reject) => {
        fs.writeFile('src/json/temp/temp.json', JSON.stringify(rows), (err) => {
            if (err) {
                reject(err)
            }
            resolve()
        })
    })
    // return a destroy function
    return ()=> new Promise((resolve, reject) => {
        fs.unlink('src/json/temp/temp.json', (err) => {
            if (err) {
                reject(err)
            }
            resolve()
        })
    })
}
fastify.post('/', async (request, reply) => {
    const {body:{items}} = request;
    let destroy = await createTempJSONFile(items)
    let pythonData = await usePython()
    await destroy()

    reply.send({pythonData});
});

fastify.listen({port: 3005},(err,addr)=>{
    if(err){
        console.log(err)
        //process.exit(1)
    }
    console.log(`Server listening at ${addr}`)
})