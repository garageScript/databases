jest.mock('../lib/log')
jest.mock('mailgun-js')
const mailgun = require('mailgun-js');

//make sendFn reject
const messages = {
    // sendReject: jest.fn().mockReturnValue( Promise.reject('err')),
    send: jest.fn().mockReturnValue( Promise.resolve('hello')),
    sendReject: jest.fn().mockReturnValue( Promise.reject('rejected'))
}

mailgun.mockImplementation(() => {
    return{
        messages: () => {
            return messages
        }
    }
})

const email = require('./mailer');


//requiring mailer uses the mailgun function so you want to initialize it after you define it at lines 8-16

const logger = {
    info: jest.fn(),
    error: jest.fn()
}

const logGen = require('../lib/log')
logGen.mockReturnValue(logger)


describe('Test mailgun', ()=>{
    beforeEach(() => {
        jest.clearAllMocks()
    })
    
    it('should test if mocksend and mailgun is called', async ()=>{
        await email.sendConfirmationEmail('paul@github.com', 'token123')
        expect(messages.send).toHaveBeenCalledTimes(1)
        expect(messages.send.mock.calls[0][0]).toMatchSnapshot()        
        expect(logger.info).toHaveBeenCalledTimes(1)
        // expect(logger.info.mock.calls[0][0]).toEqual('Confirmation Email successfully sent')        
        
    })
    it('should test throw', async ()=>{        
        try{
            await messages.sendReject.mockReturnValue(Promise.reject())
        //     expect(messages.sendReject).toHaveBeenCalledTimes(1)
        // expec(messages.sendReject.mock.calls[0][0]).toMatchSnapshot()
        }catch(error){
            // expect(logger.error).toHaveBeenCalledTimes(1)
            expect(logger.error.mock.calls[0][0]).toEqual("Confirmation Email Error:")            
        }
    })
})
