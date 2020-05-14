jest.mock('pg')
const {Client} = require('pg')
const {startPGDB, closePGDB, createPgAccount, deletePgAccount} = require('./pg')
const logger = {error: jest.fn()}

describe('Test PG DB', ()=>{
  beforeEach(()=>{
    jest.clearAllMocks()
  })
  let mockClient = {
    query: jest.fn().mockReturnValue(Promise.resolve()),
    connect: jest.fn().mockReturnValue(Promise.resolve()),
    end: jest.fn().mockReturnValue(Promise.resolve())
  }
  Client.mockImplementation(function(){
    return mockClient
  }) 
  describe('Test startPGDB && closePGDB', ()=>{
    it('it should call connect when starting PGDB', async ()=>{
      await startPGDB()
      expect(mockClient.connect).toHaveBeenCalledTimes(1)
    })
    it('it should call end when closing PGDB', async ()=>{
      await closePGDB()
      expect(mockClient.end).toHaveBeenCalledTimes(1)
    })
  })
  describe('Test create and delete pgAccount', ()=>{
    beforeEach(async ()=>{
      await startPGDB()
    })
    afterEach(async ()=>{
      await closePGDB()
    })
    describe('Test createPgAccount', ()=>{
      it('it should execute all queries if required arguments are passed into createPgAccount', async ()=>{
        await createPgAccount('username', 'password')
        expect(mockClient.query).toHaveBeenCalledTimes(3)
        expect(mockClient.query.mock.calls[0][0]).toEqual(`CREATE DATABASE IF NOT EXISTS $1`)
        expect(mockClient.query.mock.calls[0][1][0]).toEqual('username')
        expect(mockClient.query.mock.calls[1][0]).toEqual(`CREATE USER IF NOT EXISTS $1 WITH ENCRYPTED password $2`)
        expect(mockClient.query.mock.calls[1][1][0]).toEqual('username')
        expect(mockClient.query.mock.calls[1][1][1]).toEqual('password')
        expect(mockClient.query.mock.calls[2][0]).toEqual(`GRANT ALL PRIVILEGES ON DATABASE $1 TO $1`)
        expect(mockClient.query.mock.calls[2][1][0]).toEqual('username')
      })
      it('it should not execute any queries in createPgAccount if required arguments are not passed in', async ()=>{
        await createPgAccount()
        expect(mockClient.query).toHaveBeenCalledTimes(0)
      })
      it('it should check if logger.error is called at throw of createPgAccount', async ()=>{
        try{
          await mockClient.query.mockReturnValue(Promise.reject())
          const resCreatePgAccount = await createPgAccount('username', 'password')
          expect(resCreatePgAccount).rejects.toThrow()
        }catch(err){
          expect(logger.error).toHaveBeenCalledTimes(1)
        }
      })
    })
    describe('Test deletePgAccount', ()=>{
      it('it should execute all queries if required arguments are passed into deletePgAccount', async ()=>{
        mockClient.query.mockReturnValue(Promise.resolve())
        await deletePgAccount('username')
        expect(mockClient.query).toHaveBeenCalledTimes(2)
        expect(mockClient.query.mock.calls[0][0]).toEqual(`DROP DATABASE IF EXISTS $1`)
        expect(mockClient.query.mock.calls[0][1][0]).toEqual('username')
        expect(mockClient.query.mock.calls[1][0]).toEqual(`DROP USER IF EXISTS $1`)
        expect(mockClient.query.mock.calls[1][1][0]).toEqual('username')
      })
      it('it should not execute any queries in deletePgAccount if required arguments are not passed in', async ()=>{
        await deletePgAccount()
        expect(mockClient.query).toHaveBeenCalledTimes(0)
      })
      it('it should check if logger.error is called at throw of deletePgAccount', async ()=>{
        try{
          await mockClient.query.mockReturnValue(Promise.reject())
          const resDeletePgAccount = await deletePgAccount('username', 'password')
          expect(resDeletePgAccount).rejects.toThrow()
        }catch(err){
          expect(logger.error).toHaveBeenCalledTimes(1)
        }
      })
    })
  })
})
