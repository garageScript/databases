const winston = require('winston')

const logger = winston.createLogger({
    transports : [
        new winston.transports.Console()
    ]
})    

const output = (file) => {
    const obj = {}
    obj.log = (str) => {
        logger.info(`${file}: ${str}`)
    }
    obj.warn = (str) => {
        logger.warn(`${file}: ${str}`)
    }
    obj.error = (str) => {
        logger.error(`${file}: ${str}`)
    }
    return obj
}

module.exports = output