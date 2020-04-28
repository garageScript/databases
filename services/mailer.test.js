jest.mock('../lib/log')
jest.mock('mailgun-js')
const mailgun = require('mailgun-js');


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
  log: jest.fn()
}

logGen.mockReturnValue(logger)

const email = require('./mailer');

describe('Test mailgun', ()=>{
    beforeEach(() => {
        jest.clearAllMocks()
    })
    
    it('should test if mocksend and mailgun is called', ()=>{
        email.sendConfirmationEmail('paul@github.com', 'token123')
        expect(sendFn).toHaveBeenCalledTimes(1)
        expect(sendFn.mock.calls[0][1]).toEqual('paul@github.com')
        expect(sendFn.mock.calls[0][2]).toEqual('token123')
    })
})