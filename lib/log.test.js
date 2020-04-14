jest.mock('winston')
const {createLogger} = require('winston')
const logger = require('./log')(__filename)

describe('Testing log.js', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it('should call createLogger when logger.error is called', () => {
        logger.error('test message for error')
        expect(createLogger).toHaveBeenCalledTimes(1)
    })
    it('should call createLogger when logger.info is called', () => {
        logger.warn('test message for warn')
        expect(createLogger).toHaveBeenCalledTimes(1)
    })
    it('should call createLogger when logger.info is called', () => {
        logger.info('test message for info')
        expect(createLogger).toHaveBeenCalledTimes(1)
    })
})