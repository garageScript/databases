jest.mock('mailgun-js')
jest.mock('../../lib/users')
jest.mock('../../sequelize/db')

const db = require('../../sequelize/db')
const {resetPassword,updateDBPassword} = require('./userRoutes')
const {sendPasswordResetEmail,setDBPassword} = require('../../lib/users')

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
    expect(mockJson.mock.calls[0][0]).toEqual({error: {message: "Account does not exist"}})
  })

  test('should send 500 error if send password throws error', async () => {
    const userAccount = {
      id: 1,
      email: 'hello@world.com'
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

    sendPasswordResetEmail.mockImplementation(() => {
      throw new Error('error') 
    })

    await resetPassword(req, res)
    expect(res.status.mock.calls[0][0]).toEqual(500)
    expect(mockJson.mock.calls[0][0]).toEqual({ error: {message: 'Email delivery failed. Please try again'}})
  })

  test('should send 200 success if send password is successful', async () => {
    const userAccount = {
      id: 2,
      email: 'hello@world.com',
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

    sendPasswordResetEmail.mockImplementation(() => {
      return
    })

    await resetPassword(req, res)
    expect(res.status.mock.calls[0][0]).toEqual(200)
    expect(mockJson.mock.calls[0][0]).toEqual({success: {message: 'Email sucessfully sent'}})
  })
})

describe('testing patch function', () => {
  beforeEach(() => {
       jest.clearAllMocks()
  })

  it('should send error if user id not found', async() => { 
      const req ={
          params:{id:null},
          body:{password:null}
       }

       await updateDBPassword(req, res)
       return expect(mockJson.mock.calls[0][0].error.message).toEqual('invalid input of userid and password')
  })
  it('should send error if user account not found', async() => {
      db.getModels = jest.fn().mockReturnValue({
        Accounts: {
          findOne: jest.fn() 
        } 
      }) 
      const req = {
           params:{id:-2},
           body:{password:88900900}
       }
       await updateDBPassword(req,res)
       return expect(mockJson.mock.calls[0][0].error.message).toEqual('account does not exist')
  })

  it('update user password', async() => {

      const userAccount = {
        id: 12
      }

      db.getModels = jest.fn().mockReturnValue({
        Accounts: {
          findOne: jest.fn().mockReturnValue(userAccount)
        }
      })
      const req = {
          params:{id:12},
          body:{password:12345678}
      }
      

      setDBPassword.mockImplementation(() => {return})

      await updateDBPassword(req,res)
      return expect(mockJson.mock.calls[0][0]).toEqual(`success`)
  })

  it('should send error if password update failed', async() => {
      const userAccount = {
        id: 12
      }

      db.getModels = jest.fn().mockReturnValue({
        Accounts: {
          findOne: jest.fn().mockReturnValue(userAccount)
        }
      })
      const req = {
          params:{id:12},
          body:{password:'noexist'}
      }
      

     setDBPassword.mockImplementation(() => {
          throw new Error('error')
        })
        await updateDBPassword(req,res)
        return expect(mockJson.mock.calls[0][0].error.message).toEqual("Password update failed. Please try again")        

      })

  })

