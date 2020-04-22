jest.mock('mailgun')
require('dotenv').config()
const Mailgun = require('mailgun-js');


const {sendEmail} = require('./mailer.js')

describe('Test Mailgun', () => {
    beforeEach( () => {
        jest.clearAllMocks()
    })

    const mockSend = {
        send: jest.fn().mockReturnValue(Promise.resolve())
    }
    const mockMailgun = {
        messages: jest.fn(),    
    }

    // const messages = () => {
    //     return mockMailgunMessages.send
    // }

    Mailgun.mockImplementation(function(){return mockMailgun})
    
    
    describe('Test mailgun Send Email', () => {
        it('should call sendEmail', async () => {
            await sendEmail()        
            expect(mockMailgun.messages).toHaveBeenCalledTimes(1)
        })
    })
})