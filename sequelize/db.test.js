jest.mock('sequelize')
jest.mock('../lib/log')
const {Sequelize} = require('sequelize')

const logGen = require('../lib/log')
const logger = {
  error: jest.fn()
}
logGen.mockReturnValue(logger)

const {start, update, close, Account} = require('./db')

describe('Test sequelize', ()=>{
  beforeEach(()=>{
    jest.clearAllMocks()
    start()
  })
  const mockSequelize = {
    authenticate: jest.fn().mockReturnValue(Promise.resolve()),
    define: jest.fn(),
    sync: jest.fn().mockReturnValue(Promise.resolve()),
    close: jest.fn().mockReturnValue(Promise.resolve())
  }
  Sequelize.mockImplementation(function(){
    return mockSequelize
  })
  it('should test how many times authenticate is called', ()=>{
    expect(mockSequelize.define).toHaveBeenCalledTimes(1)
    expect(mockSequelize.authenticate).toHaveBeenCalledTimes(1)
  })
  it('should test how many times update is called', ()=>{
    update()
    expect(mockSequelize.sync).toHaveBeenCalledTimes(1)
  })
  it('should test how many times close is called', ()=>{
    close()
    expect(mockSequelize.close).toHaveBeenCalledTimes(1)
  })
  it('should test throw on sequelize authentication', async ()=>{
    try{
      await mockSequelize.authenticate.mockReturnValue(Promise.reject()) 
      const resStart = await start()
      expect(resStart).rejects.toThrow()
    }catch(err){
      expect(logger.error).toHaveBeenCalledTimes(1)
    }
  })
})
