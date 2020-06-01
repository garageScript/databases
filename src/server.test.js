const request = require('supertest')
const {startServer, stopServer, getApp} = require('./server')

describe('test users api for login, create, delete', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it('should respond with error with invalid input', async () => {
        const userInfo = {
            username: 'testname',
            password: 'q1w2e3r4',
            email: 'test@south.kr'
        }
        return request(app).post('/api/users', {
            method: "POST",
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(userInfo)
        }).then((res) => {
            return res.json()
        }).then((res) => {
            return expect(res).toEqual('Succeded creating user account')
        })
    })
})