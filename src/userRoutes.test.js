jest.mock('../lib/users')
jest.mock('../sequelize/db')


const {patch} = require('./database_router')

const db = require('../sequelize/db')
const users = require('../lib/users')
const genUserWithId = async (id) => {
    return {
      id:id
    }
  }
  
const mockFindOne = jest.fn()
const mockUpdate = jest.fn()
db.getModels = () => {
  return {
      Accounts: {
          findOne: mockFindOne,
          update: mockUpdate
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
            params:{id:null}
         }
         //req.params.id does not exist...
        
         await patch(req, res)
         return expect(res.json.mock.calls[0][0].error.message).toEqual('no userId')
    })
    it('should send error if user account not found', async() => {
        mockFindOne.mockReturnValue(undefined)
        const req = {
             params:{id:-2}
         }
         await patch(req,res)
         return expect(res.json.mock.calls[0][0].error.message).toEqual('account does not exist')
    })

    it('should send error if user password not found in the req body', async() => {
        
        const dataValues = await genUserWithId(12)
        
        mockFindOne.mockReturnValue({
            dataValues:dataValues
        })

        
        const req = {
            params:{id:12},
            body:{password:undefined}
        }

        await patch(req,res)
        return expect(res.json.mock.calls[0][0].error.message).toEqual('invalid password update')
    })

    
    it('should send error if password update failed', async() => {
        
        const dataValues = await genUserWithId(12)
        
        mockFindOne.mockReturnValue({
            dataValues:dataValues
        })
        users.setDBPassword.mockImplementation(() => {
            throw new Error('Error')
        })
        const req = {
            params:{id:12},
            body:{password:88987900}
        }
        await patch(req,res)

        return expect(res.json.mock.calls[0][0].error.message).toEqual('Password update failed. Please try again')
    })
    it('update user password', async() => {
        
        mockFindOne.mockImplementation(()=>{})
        mockUpdate.mockImplementation(() => {})
        users.setDBPassword.mockImplementation(() => {})
        const req = {
            params:{id:12},
            body:{password:12345678}
        }
        await patch(req,res)
         
        return expect(res.json.mock.calls[0][0]).toEqual(`success`)
    })

 }) 