const {spawn} = require('child_process');

module.exports = function usePython() {
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