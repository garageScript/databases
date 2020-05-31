const request = require('supertest')
const {getApp} = require('./server')
const db = require('../sequelize/db')
const mockFindOne = jest.fn()
const mockCreateAccount = jest.fn()
db.getModels = () => {
    return {
        Accounts: {
            findOne: mockFindOne,
            create: mockCreateAccount
        }
    }
}

app = getApp()

describe('test POST request to /api/users', () => {
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