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
const email = require('./mailer');

const logGen = require('../lib/log')
const logger = {
  error: jest.fn(),
  log: jest.fn()
}

logGen.mockReturnValue(logger)

describe('Test mailgun', ()=>{
    beforeEach(() => {
        jest.clearAllMocks()
    })
    
    it('should test if mocksend and mailgun is called', ()=>{
        email();
        expect(sendFn).toHaveBeenCalledTimes(1)
    })
})