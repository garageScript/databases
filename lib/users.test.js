jest.mock('./log')
const logGen = require('./log')
const logger = {
    info: jest.fn(),
    error: jest.fn()
}
logGen.mockReturnValue(logger)
const users = require('./users')
const bcrypt = require('bcrypt')
jest.mock('../sequelize/db')
const db = require('../sequelize/db')

const genUserInfoWithPw = async (password) => {
  return {
    username: 'testuser',
    password: await bcrypt.hash(password, 10),
    email: 'test.user@databases.com'
  }
}

const mockFindOne = jest.fn()
const mockCreateAccount = jest.fn()
const mockUpdate = jest.fn()
db.getModels = () => {
    return {
        Accounts: {
            findOne: mockFindOne,
            create: mockCreateAccount,
            update: mockUpdate
        }
    }
}

const signUp = users.signUp
const logIn = users.logIn
const setDBPassword = users.setDBPassword

describe('Validates user signup', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('function should reject if username contains invalid chars', () => {
    const obj = {
      username: '1234@gmail.com',
      email: '1234@gmail.com',
      password: 'password'
    }
    return expect(signUp(obj)).rejects.toThrow(
      'username cannot contain non-alphanumeric characters'
    )
  })
  it('function should reject if email is invalid', () => {
    const obj = {
      username: '1234@gmail.com',
      email: '1234@gmail',
      password: 'password'
    }
    return expect(signUp(obj)).rejects.toThrow(
      'email must be a valid email'
    )
  })
  it("function should reject if username doesn't exist", () => {
    const obj = {
      email: '1234@gmail.com',
      password: 'password'
    }
    return expect(signUp(obj)).rejects.toThrow(
      'username is a required field'
    )
  })
  it('function should reject if password too short', () => {
    const obj = {
      email: '1234@gmail.com',
      password: '123'
    }
    return expect(signUp(obj)).rejects.toThrow(
      'password must be at least 8 characters'
    )
  })
  it("function should reject if password doesn't exist", () => {
    const obj = {
      email: '1234@gmail.com'
    }
    return expect(signUp(obj)).rejects.toThrow(
      'password is a required field'
    )
  })
  it('should throw an error if accounts already exists', () => {
    mockFindOne.mockReturnValue({
      username: 'Batman'
    })
    const obj = {
      username: 'Batman',
      email: '1234@gmail.com',
      password: 'password'
    }
    return expect(signUp(obj)).rejects.toThrow(
      'this account already exists'
    )
  })
  it('should create a user account', async () => {
    mockFindOne.mockReturnValue(undefined)

    const obj = {
      username: 'Batman',
      email: '1234@gmail.com',
      password: 'password'
    }

    await signUp(obj)

    expect(mockCreateAccount.mock.calls.length).toEqual(1)
    expect(mockCreateAccount.mock.calls[0][0].username).toEqual('Batman')
    expect(mockCreateAccount.mock.calls[0][0].email).toEqual('1234@gmail.com')
    expect(mockCreateAccount.mock.calls[0][0].password).not.toEqual('password')
  })
})

describe('Log in', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it("should reject if user input is invalid", () => {
    const obj = {
      username: null,
      email: null,
      password: 'password'
    }
    return expect(logIn(obj)).rejects.toThrow('User input is invalid')
  })
  it("should throw error if user is not found", () => {
    mockFindOne.mockReturnValue(undefined)
    const obj = {
      username: 'noexisit',
      password: '1q2w3e4r',
      email: 'test.user@databases.com'
    }
    return expect(logIn(obj)).rejects.toThrow('User not found')
  })
  it("should throw error if password doesn't match", async () => {
    const dataValues = await genUserInfoWithPw('abcd1234')
    mockFindOne.mockReturnValue({
      dataValues: dataValues
    })
    const obj = {
        username: 'testuser',
        password: '1q2w3e4r',
        email: 'test.user@databases.com'
    }
    return expect(logIn(obj)).rejects.toThrow('Password does not match')
  })
  it("should return user information if it logs in successfully", async () => {
    const dataValues = await genUserInfoWithPw('abcd1234')
    mockFindOne.mockReturnValue({
      dataValues: dataValues
    })
    const obj = {
        username: 'testuser',
        password: 'abcd1234',
        email: 'test.user@databases.com'
    }
    return expect(logIn(obj)).resolves.toEqual(dataValues)
  })
})

describe('set DB Password', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('should throw error if it fails', async () => {
    mockUpdate.mockImplementation(() => {
      throw new Error('error')
    })
    const obj = {
      username: 'noexist',
      dbPassword: '12345678'
    }
    return expect(setDBPassword(obj)).rejects.toThrow('Failed to set DB password')
  })
  it('should call logger.info if it successes', async () => {
    mockUpdate.mockImplementation(() => {})
    const obj = {
      username: 'testuser',
      dbPassword: '12345678'
    }
    await setDBPassword(obj)
    return expect(logger.info.mock.calls[0][0]).toEqual('DB password has set successfully')
  })
})