jest.mock('../lib/users')
jest.mock('../sequelize/db')

const {patch} = require('./database_router')
const db = require('../sequelize/db')
const users = require('../lib/users')
const mockFindOne = jest.fn()

db.getModels = () => {
  return {
      Accounts: {
          findOne: mockFindOne
      }
  }
}
users.setDBPassword =jest.fn()
const res = {
     status: () => { return res },
     json: jest.fn()
}

describe('testing patch function', () => {
    beforeEach(() => {
         jest.clearAllMocks()
    })
    
    it('should send error if user id not found', async() => { 
        const req ={
            params:{id:null},
            body:{password:null}
         }
         //req.params.id does not exist...
        
         await patch(req, res)
         return expect(res.json.mock.calls[0][0].error.message).toEqual('invalid input of userid and password')
    })
    it('should send error if user account not found', async() => {
        mockFindOne.mockReturnValue(undefined)
        const req = {
             params:{id:-2},
             body:{password:88900900}
         }
         await patch(req,res)
         return expect(res.json.mock.calls[0][0].error.message).toEqual('account does not exist')
    })

    it('update user password', async() => {
        const req = {
            params:{id:12},
            body:{password:12345678}
        }
        mockFindOne.mockReturnValue({
            id:12
        })
       //users.setDBPassword.mockImplementation(() => {})
        await patch(req,res)
         
        return expect(res.json.mock.calls[0][0]).toEqual(`success`)
    })
    
    it('should send error if password update failed', async() => {
        
        const req = {
            params:{id:12},
            body:{password:'noexist'}
        }
        mockFindOne.mockReturnValue({
            id:12
        })
        
       users.setDBPassword.mockImplementation(() => {
            console.log('mock it')
            throw new Error('error')
          })
          await patch(req,res)
          console.log(res.json.mock.calls[0][0])
        
          return expect(res.json.mock.calls[0][0].error.message).toEqual("Password update failed. Please try again")

        
    
        })

        })
