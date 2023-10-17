const Fastify = require('fastify');
const cors = require('@fastify/cors');
const fastify = Fastify({
    logger: true
});

/*
 docs
 https://github.com/fastify/fastify-cors
*/
fastify.register(cors, {
    origin: '*'
});

// This is the schema for the incoming items;
fastify.addSchema({
    $id: 'item',
    type: 'object',
    required:[
        'id',
        'item_name',
        'part_number',
        'brand',
        'description',
        'item_category',
        'weight',
        'estimated_value',
        'authorized_distr_brokerage_price',
        'original_packaging_price',
        'radwell_packaging_price',
        'refurbished_price',
        'repair_price',
        'last_price_update',
        'link',
        'flagged',
        'lister_sku',
        'apn',
        'suggested_category',
        'sigma_category',
        'sigma_sku',
        'sigma_part_number',
        'approval_time',
        'user_who_approved',
        'inventory_sku',
        'series',
        'source'
    ],
    properties:{
        id : {type:'number'},
        item_name : {type:'string'},
        part_number : {type:'string'},
        brand : {type:'string'},
        description : {type:'string'},
        item_category : {type:'string'},
        weight : {type:'string'},
        estimated_value : {type:'string'},
        authorized_distr_brokerage_price : {type:'string'},
        original_packaging_price : {type:'number'},
        radwell_packaging_price : {type:'number'},
        refurbished_price : {type:'number'},
        repair_price : {type:'string'},
        last_price_update : {type:'string'},
        link : {type:'string'},
        flagged : {type:'number'},
        lister_sku : {type:'number'},
        apn : {type:'string'},
        suggested_category : {type:'string'},
        sigma_category : {type:'string'},
        sigma_sku : {type:'string'},
        sigma_part_number : {type:'string'},
        approval_time : {type:'string'},
        user_who_approved : {type:'string'},
        inventory_sku : {type:'number'},
        series : {type:'string'},
        source : {type:'string'}
    }
})
// this is the schema for the incoming payload
fastify.addSchema({
    $id:'incomingPayload',
    type:'object',
    required:['items','tokens'],
    properties:{
        items : {
            type:'array',
            maxItems: 125,
            items:{
                $ref:'item#'
            },
        },
        tokens : {
            type:'object',
            required:['clientid','clientsecret','refreshtoken','TenantToken','UserToken'],
            properties:{
                clientid : {
                    type:'string'
                },
                clientsecret : {
                    type:'string'
                },
                refreshtoken : {
                    type:'string'
                },
                TenantToken : {
                    type:'string'
                },
                UserToken : {
                    type:'string'
                }
            }
        },
    }
})

const incomingPayloadSchema ={
    schema:{
        body:{
            $ref:'incomingPayload#'
        }
    }
}

fastify.post('/importToChannelAdvisor',incomingPayloadSchema, async (request) => {
    const {body:{items}} = request;
    console.log(items);
    
    //let destroy = await createTempJSONFile(items)
    //let pythonData = await usePython()
    //await destroy()
    //reply.send({pythonData});
});

fastify.listen({port: 3005},(err,addr)=>{
    if(err){
        console.log(err)
        //process.exit(1)
    }
    console.log(`Server listening at ${addr}`)
})