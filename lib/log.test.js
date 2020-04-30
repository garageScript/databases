const winston = require('winston')
const util = require('util')

winston.createLogger = jest.fn().mockReturnValue({
    info: () => {},
    warn: () => {},
    error: () => {}
})

winston.format = {
    combine: () => {},
    timestamp: () => {},
    label: () => {},
    colorize: () => {},
    printf: jest.fn()
}

util.format = jest.fn()

describe('Testing log.js', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it('should call util.format everytime when log.xxx is called', () => {
        const logger = require('./log')(__filename)
        logger.info('message', [0,1,2])
        logger.warn('message', {obj: () => {}})
        logger.error('message', new Error('error message'))
        expect(util.format).toHaveBeenCalled()
    })
    it('should call winston.createLogger when log is required', () => {
        const logger = require('./log')(__filename)
        expect(winston.createLogger).toHaveBeenCalled()
    })
    it('should return log string correctly', () => {
        const logger = require('./log')(__filename)
        const argInPrintf = winston.format.printf.mock.calls[0][0]
        const testData = {
            timestamp: "2020-04-30 22:43:00",
            level: "info",
            label: "log.test.js",
            message: "message"
        }
        expect(argInPrintf(testData)).toBe("2020-04-30 22:43:00 info [log.test.js]: message")
    })
})