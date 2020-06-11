jest.mock('express')
jest.mock('../sequelize/db')

const express = require('express')
const dbModule = require('../sequelize/db')
const {getApp, startServer, stopServer} = require('./server')

dbModule.start = jest.fn()
dbModule.close = jest.fn()

describe('Testing the server', () => {
  test('getApp should return null when startServer has not been called', () => {
    const result = getApp() 
    expect(result).toBe(null)
  })
  test('getApp should return an express server after startServer has been called', async () => {
    express.mockReturnValue({
      use: jest.fn(),
      post: jest.fn(),
      get: jest.fn(),
      patch:jest.fn(),
      listen: jest.fn().mockImplementation( (a, b) => b()),
      name: 'Test Server',
    })

    await startServer() 

    const result = getApp()
    expect(result.name).toEqual('Test Server')
  })
  test('startServer should return an object', async () => {
    express.mockReturnValue({
      use: jest.fn(),
      post: jest.fn(),
      get: jest.fn(),
      patch:jest.fn(),
      listen: jest.fn().mockImplementation((a, b) => b()),
      name: 'Carl Sagan'
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
      use: jest.fn(),
      post: jest.fn(),
      get: jest.fn(),
      patch:jest.fn(),
      listen: mockListen,
      name: 'George Berkeley',
    })

    const result = await startServer(1000)
    expect(mockListen.mock.calls[0][0]).toBe(1000)
  })
  test('stopServer should call server.close', async () => {
    const server = {close: jest.fn()}
    express.mockReturnValue({
      use: jest.fn(),
      post: jest.fn(),
      get: jest.fn(),
      patch:jest.fn(),
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

    expect(dbModule.close).toHaveBeenCalled()
    expect(server.close).toHaveBeenCalled()
  })
})
