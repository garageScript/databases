const winston = require('winston')
winston.createLogger = jest.fn()
describe('Testing log.js', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it('should call winston.createLogger when log is required', () => {
        const logger = require('./log')(__filename)
        expect(winston.createLogger).toHaveBeenCalled()
    })
})