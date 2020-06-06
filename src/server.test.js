jest.mock('./userRoutes')
jest.mock('express')

const express = require('express')

const app = {
    use: () => {},
    post: jest.fn(),
    delete: jest.fn(),
    listen: () => {}
}
express.mockReturnValue(app) // express should be mocked before requiring server

const {startServer, stopServer, getApp} = require('./server')
const userRoutes = require('./userRoutes')

userRoutes.createUser = jest.fn()
userRoutes.loginUser = jest.fn()
userRoutes.deleteUser = jest.fn()

describe('test users api for login, create, delete', () => {
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