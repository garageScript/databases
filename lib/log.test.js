const winston = require('winston')
const util = require('util')

winston.createLogger = jest.fn().mockReturnValue({
    info: () => {},
    warn: () => {},
    error: () => {}
})

describe('Testing log.js', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it('should call util.format when log.info is called', () => {
        util.format = jest.fn()
        const logger = require('./log')(__filename)
        logger.info('message', [0,1,2], {obj: null}, new Error('error message'))
        expect(util.format).toHaveBeenCalled()
    })
    it('should call winston.createLogger when log is required', () => {
        winston.createLogger = jest.fn()
        const logger2 = require('./log')(__filename)
        expect(winston.createLogger).toHaveBeenCalled()
    })
})