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
            const mappedArgs = args.map((e) => {
                if (e instanceof Error) return e.toString
                return e
            })
            logger.info(util.format('%j', mappedArgs))
        },
        warn: (...args) => {
            const mappedArgs = args.map((e) => {
                if (e instanceof Error) return e.toString
                return e
            })
            logger.warn(util.format('%j', mappedArgs))
        },
        error: (...args) => {
            const mappedArgs = args.map((e) => {
                if (e instanceof Error) return e.toString
                return e
            })
            logger.error(util.format('%j', mappedArgs))
        }
    }

    return obj        
}