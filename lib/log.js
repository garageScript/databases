const {createLogger, format, transports} = require('winston')

module.exports = (file) => {
    const logger = createLogger({
        format: format.combine(
            format.label({
                label: file
            }),
            format.colorize(),
            format.printf(
                info => `
    LEVEL: ${info.level}
    FILENAME: ${info.label}
    MESSAGE: ${info.message}
`
            )
        ),
        transports : [
            new transports.Console()
        ]
    })
    return logger        
}