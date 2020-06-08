jest.mock('../lib/users')
const users = require('../lib/users')
users.logIn = jest.fn()
const {loginUser, logoutUser} = require('./userRoutes')

const res = {
    status: () => { return res },
    json: jest.fn()
}

describe('testing loginUser function', () => {
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

describe('testing logoutUser function', () => {
    it('should clear session', () => {
        const req = {
            params: { id: 99999999 },
            session: { username: 'username' }
        }
        logoutUser(req, res)
        expect(req.session.username).toEqual('')
    })

})