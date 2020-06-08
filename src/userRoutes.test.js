jest.mock('../lib/users')
const users = require('../lib/users')
users.logIn = jest.fn()
const {createUser, deleteUser, loginUser} = require('./userRoutes')

const res = {
    status: () => { return res },
    json: jest.fn()
}

describe('testing createUser function', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it('should send error if login fails', async () => {
        users.logIn.mockImplementation(() => {
            throw new Error('Error')
        })
        const req = {
            body: {
                username: 'username',
                email: 'em@i.l',
                password: '1q2w3e4r'
            }
        }
        await loginUser(req, res)
        return expect(res.json.mock.calls[0][0].error.message).toEqual('Login user failed. Please try again')
    })
    it('should login user', async () => {
        users.logIn.mockImplementation(() => {
            return {
                username: 'username'
            }
        })
        const req = {
            body: {
                username: 'username',
                email: 'em@i.l',
                password: '1q2w3e4r'
            },
            session: {}
        }
        await loginUser(req, res)
        return expect(res.json.mock.calls[0][0]).toEqual('username is logged in')
    })
})