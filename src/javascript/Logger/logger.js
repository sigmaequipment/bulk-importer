/*
************************************************************************************************************************
* Sigma Logger
* Version: 1.0.0
* Description: Logger to create permanent records of events
 */

const fs = require('fs');
const path = require('path');

function findRootFolder() {
    let currentPath = __dirname;
    while (currentPath !== '/') {
        if (fs.existsSync(path.join(currentPath, 'package.json'))) {
            return currentPath;
        }
        currentPath = path.join(currentPath, '..');
    }
    return null;
}

function init() {
    const rootFolder = findRootFolder();
    if (!rootFolder) {
        throw new Error('Unable to find root folder');
    }
    const logFolder = path.join(rootFolder, 'logs');
    if (!fs.existsSync(logFolder)) {
        fs.mkdirSync(logFolder);
    }
}
let logger;
class Logger {
    constructor() {
        this.usesTimestamp = true;
        this.usesConsole = true;
    }
    createFile() {
        const date = new Date();
        let getDate = date.getDate();
        if(getDate < 10){
            getDate = `0${getDate}`
        }
        let getMonth = date.getMonth() + 1;
        if(getMonth < 10){
            getMonth = `0${getMonth}`
        }
        const fileName = `${date.getFullYear()}-${getMonth}-${getDate}-log.log`;
        const rootFolder = findRootFolder();
        const logFolder = path.join(rootFolder, 'logs');
        return path.join(logFolder, fileName);
    }
    writeToLog(message) {
        const date = new Date();
        const fileName = this.createFile();
        const hour = date.getHours();
        const minute = date.getMinutes();
        const second = date.getSeconds();
        let timeStamp = `${date.toDateString()} ${hour}:${minute}:${second}`
        const logMessage =
            `${this.usesTimestamp ? timeStamp : ""} ${message}\n`;
        fs.appendFileSync(fileName, logMessage);
    }
    log =(...message)=> {
        this.writeToLog(message.join(' '));
        if (this.usesConsole) {
            console.log(...message);
        }
    }
    error=(...message)=> {
        this.writeToLog(message.join(' '));
        if (this.usesConsole) {
            console.error(...message);
        }
    }
    warn=(...message)=> {
        this.writeToLog(message.join(' '));
        if (this.usesConsole) {
            console.warn(...message);
        }
    }
    info=(...message)=> {
        this.writeToLog(message.join(' '));
        if (this.usesConsole) {
            console.info(...message);
        }
    }
    debug=(...message)=> {
        this.writeToLog(message.join(' '));
        if (this.usesConsole) {
            console.debug(...message);
        }
    }
    trace=(...message)=> {
        this.writeToLog(message.join(' '));
        if (this.usesConsole) {
            console.trace(...message);
        }
    }

}

logger = new Logger();
const { log, error, warn, info, debug, trace } = logger;
init();
logger.log("Logger initialized");
module.exports = {
    log,
    error,
    warn,
    info,
    debug,
    trace
}