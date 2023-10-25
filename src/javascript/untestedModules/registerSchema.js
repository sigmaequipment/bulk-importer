const fs = require('fs');

module.exports = function registerSchema(path,fastify) {
    let schemas = fs.readFileSync(path, 'utf8')
    schemas = JSON.parse(schemas)
    schemas.forEach((schema) => {
        fastify.addSchema(schema)
    })
}