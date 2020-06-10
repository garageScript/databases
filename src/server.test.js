jest.mock('./routes/userRoutes')
jest.mock('express')
jest.mock('../sequelize/db')

const express = require('express')
const dbModule = require('../sequelize/db')
const userRoutes = require('./routes/userRoutes')
const {startServer, stopServer, getApp} = require('./server')

dbModule.start = jest.fn()
userRoutes.createUser = jest.fn()
userRoutes.loginUser = jest.fn()
userRoutes.deleteUser = jest.fn()

const app = {
  use: () => {},
  get: () => {},
  post: jest.fn(),
  delete: jest.fn(),
  listen: jest.fn().mockImplementation((port, callback) => callback()),
  name: 'Carl Sagan'
}
express.mockReturnValue(app)

describe('Testing the server', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('getApp should return null when startServer has not been called', () => {
    const result = getApp() 
    expect(result).toBe(null)
  })
  test('getApp should return an express server after startServer has been called', async () => {
    await startServer() 
    const result = getApp()
    expect(result.name).toEqual('Carl Sagan')
  })
  test('startServer should return an object', async () => {
    const result = await startServer(1000)
    expect(result.listen.mock.calls[0][0]).toBe(1000)
  })
  test('stopServer should call server.close', async () => {
    const server = {close: jest.fn()}
    app.listen.mockImplementation((a,b) => {
      // Need to setTimeout so the promise resolves
      //   is called after the function returns
      setTimeout(b, 1)
      return server
    })
    
    await startServer()
    stopServer()
    
    expect(server.close.mock.calls.length).toEqual(1)
  })
})

describe('Testing routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('should call createUser, loginUser, deleteUser function', () => {
    startServer().then(() => {
      app.post.mock.calls[0][1]()
      expect(userRoutes.createUser).toHaveBeenCalled()
      app.post.mock.calls[1][1]()
      expect(userRoutes.loginUser).toHaveBeenCalled()
      app.delete.mock.calls[0][1]()
      expect(userRoutes.deleteUser).toHaveBeenCalled()
    })
  })
})