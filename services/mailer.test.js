jest.mock('../lib/log')
const mailgun = require('mailgun-js');
const email = require('./mailer');

const mockSend = jest.fn()
jest.mock('mailgun-js', () => {
    return jest.fn(() =>({
        messages: ()=>({
            send: mockSend
        })
    }))
})

// const data = {
//     from: 'mock@mail.com',
//     to: 'mock@mailer.com',
//     subject: 'Congratulations!',
//     text: 'Welcome to C0D3',
//     html: "<h1>Confirm your E-mail</h1><button>Confirm</button>"
// };

const logGen = require('../lib/log')
const logger = {
  error: jest.fn(),
  log: jest.fn()
}

logGen.mockReturnValue(logger)

describe('Test mailgun', ()=>{
    it('should test if mocksend and mailgun is called', ()=>{
        email()
        expect(mockSend).toHaveBeenCalledTimes(1)
        expect(mailgun).toHaveBeenCalledTimes(1)
        expect(logger.info).toHaveBeenCalledTimes(1)
    })
})