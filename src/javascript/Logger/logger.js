const winston = require('winston')
require('winston-daily-rotate-file');

const { combine, timestamp, json, colorize, align, printf, errors } = winston.format;

const errorFilter = winston.format((info) => {
    return info.level === 'error' ? info : false;
});

const plainTextFormatter = printf((info) => {
    const { level, message, timestamp, ...meta } = info;
    let metaText;
    if(Object.entries(meta).length > 0){
        metaText = JSON.stringify(Object.entries(meta).reduce((acc,[key,val]) => {
            acc[key] = val;
            return acc;
        },{}));
    }
    return `[${timestamp}] ${level}: ${message} ${metaText ? metaText : ""}`
});

const timeStampFormatter = timestamp({ format: 'MM-DD-YYYY hh:mm:ss.SSS A' })

const CLI = combine(
    colorize(),
    timeStampFormatter,
    align(),
    plainTextFormatter
)

const generalTransport = new winston.transports.DailyRotateFile({
    filename: './logs/%DATE%-logs.log',
    format: combine(timestamp(), json()),
    datePattern: 'MM-DD-YYYY',
    maxFiles: '30d',
});

const plainTextOutput = new winston.transports.DailyRotateFile({
    filename: './logs/%DATE%-plain.log',
    format: combine(
        timeStampFormatter,
        align(),
        plainTextFormatter
    ),
    datePattern: 'MM-DD-YYYY',
    maxFiles: '30d',
});

const errorTransport = new winston.transports.DailyRotateFile({
    filename: './logs/%DATE%-error.log',
    format: combine(errorFilter(), timeStampFormatter, json()),
    datePattern: 'MM-DD-YYYY',
    maxFiles: '30d',
});

const cliTransport = new winston.transports.Console({
    format: CLI
});

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: combine(errors({ stack: true }), timeStampFormatter, json()),
    exitOnError: false,
    exceptionHandlers: [
        errorTransport,
    ],
    rejectionHandlers: [
        errorTransport,
    ],
    transports: [
        cliTransport,
        plainTextOutput,
        errorTransport,
        generalTransport,
    ]
});


let { error, warn, info, debug, trace } = logger;
const log = info

logger.log("Logger initialized");
module.exports = {
    log,
    error,
    warn,
    info,
    debug,
    trace
}
exports.Logger = logger;