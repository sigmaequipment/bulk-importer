module.exports = async function createTempJSONFile(rows,fs=fs) {
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