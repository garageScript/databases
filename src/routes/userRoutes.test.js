jest.mock('mailgun-js')
jest.mock('../../lib/users')
jest.mock('../../sequelize/db')

const db = require('../../sequelize/db')
const {resetPassword} = require('./userRoutes')
const {sendPasswordResetEmail} = require('../../lib/users')

const mockJson = jest.fn()

const res = {
  status: jest.fn().mockReturnValue({json: mockJson})
}

describe('Testing user routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('should send 400 error if req body does not have email', async () => {
    const req = {
      body: {}
    }

    await resetPassword(req, res)
    expect(res.status.mock.calls[0][0]).toEqual(400)
    expect(mockJson.mock.calls[0][0]).toEqual({error: {message: "invalid input"}})
  })

  test('Should send 400 error if user account does not exist', async () => {
    db.getModels = jest.fn().mockReturnValue({
      Accounts: {
        findOne: jest.fn() 
      } 
    }) 

   const req = {
     body: {
       email: 'hello@world.com',
     } 
   } 

    await resetPassword(req, res)
    expect(res.status.mock.calls[0][0]).toEqual(400)
    expect(mockJson.mock.calls[0][0]).toEqual({error: {message: "account does not exist"}})
  })

  test('should send 500 error if send password throws error', async () => {
    db.getModels = jest.fn().mockReturnValue({
      Accounts: {
        findOne: jest.fn().mockReturnValue({
          where: {
            email: jest.fn()
          }
        })
      }
    })

    const req = {
      body: {
        email: 'hello@world.com'
      }
    }

    await resetPassword(req, res)
    expect(res.status.mock.calls[0][0]).toEqual(500)
    expect(mockJson.mock.calls[0][0]).toEqual({ error: {message: 'Email delivery failed. Please try again'}})
  })

  test('should send 200 success if send password is sucessful', async () => {
    const userAccount = {
      id: 1,
      username: 'hello',
      email: 'hello@world.com',
      password: 1234567890
    }

    db.getModels = jest.fn().mockReturnValue({
      Accounts: {
        findOne: jest.fn().mockReturnValue(userAccount)
      }
    })

    const req = {
      body: {
        email: 'hello@world.com' 
      } 
    }

    await resetPassword(req, res)
    expect(res.status.mock.calls[0][0]).toEqual(200)
    expect(mockJson.mock.calls[0][0]).toEqual({error: {message: 'email sucessfully sent'}})
  })
})
