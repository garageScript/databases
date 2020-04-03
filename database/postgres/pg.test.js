const pgClient = require('pg')

describe('Test PG DB', ()=>{
  afterEach(()=>{
    jest.clearAllMocks()
  })
  let mockClient = {
    query: jest.fn().mockReturnValue(Promise.resolve()),
    connect: jest.fn().mockReturnValue(Promise.resolve()),
    end: jest.fn().mockReturnValue(Promise.resolve())
  }
  pgClient.Client = function(){
    this.query = mockClient.query
    this.connect = mockClient.connect
    this.end = mockClient.end
  }
  let {startPGDB, closePGDB, createPgAccount, deletePgAccount} = require('./pg')
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
  describe('Test createPgAccount', ()=>{
    it('it should execute all queries if required arguments are passed into createPgAccount', async ()=>{
        await startPGDB() 
        await createPgAccount('username', 'password')
        expect(mockClient.query).toHaveBeenCalledTimes(3)
        expect(mockClient.query).toHaveBeenNthCalledWith(1, `CREATE DATABASE IF NOT EXISTS username`)
        expect(mockClient.query).toHaveBeenNthCalledWith(2, `CREATE USER IF NOT EXISTS username WITH ENCRYPTED password 'password'`)
        expect(mockClient.query).toHaveBeenNthCalledWith(3, `GRANT ALL PRIVILEGES ON DATABASE username TO username`)
        await closePGDB()
    })
    it('it should not execute any queries in createPgAccount if required arguments are not passed in', async ()=>{
        await startPGDB()
        await createPgAccount()
        expect(mockClient.query).toHaveBeenCalledTimes(0)
        await closePGDB()
    })
  })
  describe('Test deletePgAccount', ()=>{
    it('it should execute all queries if required arguments are passed into deletePgAccount', async ()=>{
        await startPGDB()
        await deletePgAccount('username')
        expect(mockClient.query).toHaveBeenCalledTimes(2)
        expect(mockClient.query).toHaveBeenNthCalledWith(1, `DROP DATABASE IF EXISTS username`)
        expect(mockClient.query).toHaveBeenNthCalledWith(2, `DROP USER IF EXISTS username`)
        await closePGDB()
    })
    it('it should not execute any queries in deletePgAccount if required arguments are not passed in', async ()=>{
        await startPGDB()
        await createPgAccount()
        expect(mockClient.query).toHaveBeenCalledTimes(0)
        await closePGDB()
    })
  })
})
