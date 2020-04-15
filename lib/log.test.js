jest.mock('winston')
const winston = require('winston')
winston.createLogger = jest.fn().mockImplementation(() => {
    return {
        error: () => {},
        warn: () => {},
        info: () => {}
    }
})
winston.format = {
    combine: () => {},
    timestamp: () => {},
    label: () => {},
    colorize: () => {},
    printf: () => {}
}
winston.transports.Console = function(){}

describe('Testing log.js', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it('should call winston.createLogger when log is required', () => {
        const logger = require('./log')(__filename)
        expect(winston.createLogger).toHaveBeenCalled()
    })
})