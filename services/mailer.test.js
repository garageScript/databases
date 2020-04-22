const email = require('./mailer');
const mailgun = require('mailgun-js');
const mockSend = jest.fn(()=>Promise.resolve());

jest.mock('mailgun-js', () => {
    return jest.fn(() =>({
        messages: ()=>({
            send: mockSend
        })
    }))
})

describe('Test mailgun', ()=>{
    it('mailgun', ()=>{
        email()
        expect(mockSend).toHaveBeenCalledTimes(1)
        expect(mailgun).toHaveBeenCalledTimes(1)
    })
})