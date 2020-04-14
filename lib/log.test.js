jest.mock('winston')
const {createLogger} = require('winston')
jest.unmock('winston')
const {format, transports} = require('winston')
const logger = require('./log')(__filename)

describe('Testing log.js', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it('should call createLogger when logger.error is called', () => {
        logger.error('test message for error')
        expect(createLogger).toHaveBeenCalled()
    })
    it('should call createLogger when logger.warn is called', () => {
        logger.warn('test message for warn')
        expect(createLogger).toHaveBeenCalled()
    })
    it('should call createLogger when logger.info is called', () => {
        logger.info('test message for info')
        expect(createLogger).toHaveBeenCalled()
    })
})