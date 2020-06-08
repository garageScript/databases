jest.mock('../lib/users')
const users = require('../lib/users')
users.signUp = jest.fn()
jest.mock('../sequelize/db')
const db = require('../sequelize/db')
const mcokFindOne = jest.fn()
db.getModels = () => {
    return {
        Accounts: {
            findOne: mcokFindOne
        }
    }
}
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

describe('testing deleteUser function', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it('should send error if input is invalid', async () => {
        const req = {
            params: { id: null }
        }
        await deleteUser(req, res)
        return expect(res.json.mock.calls[0][0].error.message).toEqual("user id was not provided")
    })
    it('should send error if account is not found', async () => {
        const req = {
            params: { id: 99999999 }
        }
        mcokFindOne.mockReturnValue(null)
        await deleteUser(req, res)
        return expect(res.json.mock.calls[0][0].error.message).toEqual("Cannot find user")
    })
    it('should send error if user session does not match', async () => {
        const req = {
            params: { id: 99999999 },
            session: { username: 'testuserA' }
        }
        mcokFindOne.mockReturnValue({
            username: 'testuserB'
        })
        await deleteUser(req, res)
        return expect(res.json.mock.calls[0][0].error.message).toEqual("Username does not match to cookie")
    })
    it('should delete user', async () => {
        const req = {
            params: { id: 99999999 },
            session: { username: 'testuserA' }
        }
        mcokFindOne.mockReturnValue({
            username: 'testuserA',
            destroy: () => {}
        })
        await deleteUser(req, res)
        return expect(res.json.mock.calls[0][0]).toEqual("Succeded deleting user account")
    })
    it('should send error delete user fails', async () => {
        const req = {
            params: { id: 99999999 },
            session: { username: 'testuserA' }
        }
        mcokFindOne.mockReturnValue({
            username: 'testuserA',
            destroy: () => { throw new Error('Error')}
        })
        await deleteUser(req, res)
        return expect(res.json.mock.calls[0][0].error.message).toEqual("Deleting user failed. Please try again")
    })
})