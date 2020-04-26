const {createLogger, format, transports} = require('winston')
const util = require('util')

module.exports = (file) => {
    const logger = createLogger({
        format: format.combine(
            format.timestamp({format:'YYYY-MM-DD HH:mm:ss'}),
            format.label({
                label: file
            }),
            format.colorize(),
            format.printf(
                info => `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`
            )
        ),
        transports : [
            new transports.Console()
        ]
    })

    const obj = {
        info: (...args) => {
            logger.info(util.format('%j', args))
        },
        warn: (...args) => {
            logger.warn(util.format('%j', args))
        },
        error: (...args) => {
            logger.error(util.format('%j', args))
        }
    }

    return obj        
}