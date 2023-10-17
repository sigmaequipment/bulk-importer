const fs = require('fs')

module.exports = async function createTempJSONFile(rows,fsi=fs) {
    await new Promise((resolve, reject) => {
        fsi.writeFile('src/json/temp/temp.json', JSON.stringify(rows), (err) => {
            if (err) {
                reject(err)
            }
            resolve()
        })
    })
    // return a destroy function
    return ()=> new Promise((resolve, reject) => {
        fsi.unlink('src/json/temp/temp.json', (err) => {
            if (err) {
                reject(err)
            }
            resolve()
        })
    })
}