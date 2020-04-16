const {createLogger, format, transports} = require('winston')

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
    return logger        
}