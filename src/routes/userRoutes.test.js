jest.mock('mailgun-js')
jest.mock('../../sequelize/db')
jest.mock('../../services/mailer')

const {resetPassword} = require('./userRoutes')
const db = require('../../sequelize/db')
const email = require('../../services/mailer')

const mockJson = jest.fn()

const res = {
  status: jest.fn().mockReturnValue({json: mockJson})
}

describe('Testing user routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('should throw error if req body does not have email', async () => {
    const req = {
      body: {}
    }

    await resetPassword(req, res)
    expect(res.status.mock.calls[0][0]).toEqual(400)
    expect(mockJson.mock.calls[0][0]).toEqual({error: {message: "invalid input"}})
  })
  test('should throw error if user account is not found', async () => {
    db.getModels = jest.fn().mockReturnValue({
      Accounts: {
        findOne: jest.fn() 
      } 
    }) 

   const req = {
     body: {
       id: 1234,
       email: 'hello@world.com',
     } 
   } 

    await resetPassword(req, res)
    expect(res.status.mock.calls[0][0]).toEqual(400)
    expect(mockJson.mock.calls[0][0]).toEqual({error: {message: "account does not exist"}})
  })
  test('Should send response with status 400 if user account does not exist', async () => {
    db.getModels = jest.fn().mockReturnValue({
      Accounts: {
        findOne: jest.fn()
      }
    })

    const req = {
      body: {
        email: 'hello@world.com'
      }
    }

    sendPasswordResetEmail = jest.fn().mockReturnValue(null)

    await resetPassword(req, res)
    expect(res.status.mock.calls[0][0]).toEqual(500)
    expect(mockJson.mock.calls[0][0]).toEqual({ error: {message: 'Email delivery failed. Please try again'}})
  
  })
})
