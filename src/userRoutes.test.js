jest.mock('../lib/users')
const users = require('../lib/users')
const {createUser, deleteUser, loginUser} = require('./userRoutes')

users.signUp = jest.fn()

const res = {
    status: () => { return res },
    json: jest.fn()
}

describe('testing createUser function', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it('should send error if input is invalid', () => {
        const req = null
        createUser(req, res)
        expect(res.json.mock.calls[0][0].error.message).toEqual("invalid input")
    })
    it('should send error if sign up fails', () => {
        users.signUp.mockImplementation(() => {
            throw new Error('Error')
        })
        const req = {
            body: {
                username: 'username',
                email: 'em@i.l',
                password: '1q2w3e4r'
            }
        }
        createUser(req, res)
        expect(res.json.mock.calls[0][0].error.message).toEqual('Creating user failed. Please try again')
    })
    it('should create user account', () => {
        const req = {
            body: {
                username: 'username',
                email: 'em@i.l',
                password: '1q2w3e4r'
            }
        }
        expect(res.json.mock.calls[0][0]).toEqual('Succeded creating user account')
    })
})