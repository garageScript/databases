const {createLogger, format, transports} = require('winston')
const logger = require('./log')(__filename)

describe('Testing log.js', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    let mockedConsoleLogOutput = ''
    console.log = (input) => {
        mockedConsoleLogOutput = input
    }

    it('should console.log error level message correctly', () => {
        logger.error('test message for error')
        expect(mockedConsoleLogOutput).toEqual(
            `
    LEVEL: error
    FILENAME: ${__filename}
    MESSAGE: test message for error
`
        )
    })
})