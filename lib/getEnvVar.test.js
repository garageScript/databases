describe('test getEnvVar', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it('should return mailgun env var', () => {
        process.env.MAILGUN_API_KEY = 'test key'
        const getEnvVar = require('./getEnvVar')
        expect(getEnvVar('mailgun').apiKey).toEqual('test key')
    })
    it('should return default mailgun env var', () => {
        delete process.env.MAILGUN_API_KEY
        const getEnvVar = require('./getEnvVar')
        expect(getEnvVar('mailgun').apiKey).toEqual('123')
    })
    it('should return nothing without argument', () => {
        const getEnvVar = require('./getEnvVar')
        expect(getEnvVar()).toEqual(undefined)
    })
})