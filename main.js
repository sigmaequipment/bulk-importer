const Fastify = require('fastify');


const fastify = Fastify({
    logger: true
});









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