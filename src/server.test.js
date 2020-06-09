jest.mock('express')
jest.mock('../sequelize/db')
const express = require('express')
const {getApp, startServer, stopServer} = require('./server')
const app ={
	use:()=>{},
	patch:jest.fn(),
	listen:()=>{}
}
express.mockReturnValue(app)
const dbModule = require('../sequelize/db')

dbModule.start = jest.fn()
const userRoutes = require('./userRoutes')
userRoutes.patch = jest.fn()
describe('test users api for patch', () => {
     beforeEach(() => {
         jest.clearAllMocks()
     })
     it('should call patch function', () => {
         startServer().then(() => {
             app.patch.mock.calls[0][1]()
             expect(userRoutes.patch).toHaveBeenCalled()
         })
     })
 }) 
describe('Testing the server', () => {
  test('getApp should return null when startServer has not been called', () => {
    const result = getApp() 

    expect(result).toBe(app)
  })
  test('getApp should return an express server after startServer has been called', async () => {
    express.mockReturnValue({
	use: () => {},
      patch: jest.fn(),    
  	name: 'Test Server',
      listen: jest.fn().mockImplementation( (a, b) => b() )
    })

    await startServer() 

    const result = getApp()
    expect(result.name).toEqual('Test Server')
  })
  test('startServer should return an object', async () => {
    express.mockReturnValue({
      use: () => {},
      patch: jest.fn(),
	name: 'Carl Sagan',
      listen: jest.fn().mockImplementation((a, b) => b())
    })

    const result = await startServer()
    expect(result.name).toEqual('Carl Sagan')
  })
  test('startServer should call app.listen with a port number', async () => {
    let mockListen = jest.fn().mockImplementation((a,b) => {
        b()
        return a
  })
    express.mockReturnValue({
      use: () => {},
      patch: jest.fn(),
	name: 'George Berkeley',
      listen: mockListen
    })

    const result = await startServer(1000)
    expect(mockListen.mock.calls[0][0]).toBe(1000)
  })
  test('stopServer should call server.close', async () => {
    const server = {close: jest.fn()}
    express.mockReturnValue({
	use: () => {},
      patch: jest.fn(),
      listen: jest.fn().mockImplementation((a,b) => {
        // Need to setTimeout so the promise resolves
        //   is called after the function returns
        setTimeout(() => {
          b()
        }, 1)
        return server
      })
    })

    await startServer()
    stopServer()

    expect(server.close.mock.calls.length).toEqual(1)
  })
})
