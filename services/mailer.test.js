jest.mock('../lib/log')
jest.mock('mailgun-js')
const mailgun = require('mailgun-js');

//make sendFn reject
const messages = {
    sendFn: jest.fn().mockReturnValue( Promise.reject('err'))
}

mailgun.mockImplementation(() => {
    return{
        messages: () => {
            return messages
        }
    }
})

const sendFn = jest.fn().mockReturnValue( Promise.resolve('hello'))

mailgun.mockImplementation(() => {
    return{
        messages: () => {
            return {
                send: sendFn
            }
        }
    }
})

//requiring mailer uses the mailgun function so you want to initialize it after you define it at lines 8-16

const logGen = require('../lib/log')
const logger = {
  error: jest.fn(),
  info: jest.fn()
}

logGen.mockReturnValue(logger)
const email = require('./mailer');

describe('Test mailgun', ()=>{
    beforeEach(() => {
        jest.clearAllMocks()
    })
    
    it('should test if mocksend and mailgun is called', async ()=>{
        await email.sendConfirmationEmail('paul@github.com', 'token123')
        expect(sendFn).toHaveBeenCalledTimes(1)
        expect(sendFn.mock.calls[0][0]).toMatchSnapshot()
        expect(logger.info.mock.calls[0][0]).toEqual('Confirmation Email successfully sent')        
        expect(logger.error.mock.calls[0][0]).toEqual("Confirmation Email Error:")
        // expect(logger.info).toHaveBeenCalledTimes(1)
        
    })
})
