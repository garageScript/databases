jest.mock('../lib/users')
const users = require('../lib/users')
users.signUp = jest.fn()
const {createUser, deleteUser, loginUser} = require('./userRoutes')

const res = {
    status: () => { return res },
    json: jest.fn()
}

describe('testing createUser function', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it('should send error if input is invalid', async () => {
        const req = {
            body: {
                username: null,
                email: null,
                password: null
            }
        }
        await createUser(req, res)
        return expect(res.json.mock.calls[0][0].error.message).toEqual("invalid input")
    })
    it('should send error if sign up fails', async () => {
        users.signUp.mockImplementation(() => {
            throw new Error('Error')
        })
        const req = {
            body: {
                username: 'username',
                email: 'em@i.l',
                password: '1q2'
            }
        }
        await createUser(req, res)
        return expect(res.json.mock.calls[0][0].error.message).toEqual('Creating user failed. Please try again')
    })
    it('should create user account', async () => {
        users.signUp.mockImplementation(() => {
            return
        })
        const req = {
            body: {
                username: 'username',
                email: 'em@i.l',
                password: '1q2w3e4r'
            }
        }
        await createUser(req, res)
        return expect(res.json.mock.calls[0][0]).toEqual('Succeded creating user account')
    })
})