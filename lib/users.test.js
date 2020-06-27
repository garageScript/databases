jest.mock('mailgun-js')
jest.mock('../sequelize/db')
jest.mock('../services/mailer')
jest.mock('./log')
// require('./log') and mock should be before requiring everything

const logGen = require('./log')
const logger = {
    info: jest.fn(),
    error: jest.fn()
}
logGen.mockReturnValue(logger)

const {signUp, logIn, setDBPassword, sendPasswordResetEmail, resetUserPassword} = require('./users')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const db = require('../sequelize/db')
const email = require('../services/mailer')

email.sendPasswordResetEmail = jest.fn()

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

describe('Sign up', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('function should reject if username contains invalid chars', () => {
    const obj = {
      username: '1234@gmail.com',
      email: '1234@gmail.com'
    }
    return expect(signUp(obj)).rejects.toThrow(
      'username cannot contain non-alphanumeric characters'
    )
  })

  it('function should reject if email is invalid', () => {
    const obj = {
      username: '1234@gmail.com',
      email: '1234@gmail'
    }
    return expect(signUp(obj)).rejects.toThrow(
      'email must be a valid email'
    )
  })

  it("function should reject if username doesn't exist", () => {
    const obj = {
      email: '1234@gmail.com'
    }
    return expect(signUp(obj)).rejects.toThrow(
      'username is a required field'
    )
  })

  it('should throw an error if accounts already exists', () => {
    mockFindOne.mockReturnValue({
      username: 'Batman'
    })
    const obj = {
      username: 'Batman',
      email: '1234@gmail.com'
    }
    return expect(signUp(obj)).rejects.toThrow(
      'this account already exists'
    )
  })

  it('should create a user account', async () => {
    const dataValues = await genUserInfoWithPw('abcd1234')
    mockFindOne.mockReturnValue(undefined)
    mockCreateAccount.mockReturnValue({
      dataValues: dataValues,
      update: () => {}
    })
    const obj = {
      username: 'testuser',
      email: 'test.user@databases.com'
    }
    const data = await signUp(obj)
    expect(data.dataValues).toEqual(dataValues)
  })

  it('should send a user set Password email', async () => {
    const obj = {
      id: 4,
      username: 'Batman',
      email: 'Batman',
      update: jest.fn()
    }

    await sendPasswordResetEmail(obj)
    expect(email.sendPasswordResetEmail.mock.calls.length).toEqual(1)
    expect(email.sendPasswordResetEmail.mock.calls[0][0]).toEqual('Batman')
  })
})

describe('Log in', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('should reject if user input is invalid', () => {
    const obj = {
      username: null,
      email: null,
      password: 'password'
    }
    return expect(logIn(obj)).rejects.toThrow('User input is invalid')
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
  it('should return user information if it logs in successfully', async () => {
    const dataValues = await genUserInfoWithPw('abcd1234')
    mockFindOne.mockReturnValue({
      dataValues: dataValues
    })
    const obj = {
      username: 'testuser',
      password: 'abcd1234',
      email: 'test.user@databases.com'
    }
    const data = await logIn(obj)
    return expect(data.dataValues).toEqual(dataValues)
  })
  it('should throw error if user is not found', () => {
    mockFindOne.mockReturnValue(undefined)
    const obj = {
      username: 'noexisit',
      password: '1q2w3e4r',
      email: 'test.user@databases.com'
    }
    return expect(logIn(obj)).rejects.toThrow('User not found')
  })
})

describe('set DB Password', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('should throw error if input is invalid', async () => {
    const obj = {}
    return expect(setDBPassword(obj, '12345678')).rejects.toThrow('invalid input: username and DB password cannot be empty')
  })
  it('should throw error if it fails', async () => {
    mockUpdate.mockImplementation(() => {
      throw new Error('error')
    })
    const obj = {
      username: 'noexist'
    }
    return expect(setDBPassword(obj, '12345678')).rejects.toThrow('Failed to set DB password')
  })
  it('should return user data if it successes', async () => {
    const dataValues = await genUserInfoWithPw('abcd1234')
    mockUpdate.mockImplementation(() => {
      return [1, [{dataValues: dataValues}]]
    })
    const obj = {
      username: 'testuser'
    }
    const data = await setDBPassword(obj, '12345678')
    return expect(data.dataValues).toEqual(dataValues)
  })
})

describe('reset user password', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('should throw an error without a token', async () => {
    const token = undefined 
    const password = '012345678'

    
    const result = await resetUserPassword(token, password)
    expect(result).toEqual(Error('no token for resetUserPassword'))
  })
  it('should throw an error without a password', async () => {
    const token = {}
    const password = undefined

    const result = await resetUserPassword(token, password)
    expect(result).toEqual(Error('no password for resetUserPassword'))
  })
  it('should throw error if user account is not found in database', async () => {
    mockFindOne.mockReturnValue(undefined)
    const account = {id: 1} 
    const token = Buffer.from(JSON.stringify(account)).toString('base64')
    const password = '12345678910'

    const result = await resetUserPassword(token, password)
    expect(result).toEqual(Error('user account not found'))
  })
  it('should throw error if tokens do not match', async () => {
    const account = {
      id: 2,
      userToken: 'abc',
    }
    const token = Buffer.from(JSON.stringify(account)).toString('base64')

    mockFindOne.mockReturnValue({
      id: 2,
      userToken: '234',
    })

    const password = '12345678910'

    const result = await resetUserPassword(token, password)
    expect(result).toEqual(Error('user tokens do not match'))
  })
  it('should throw error if token is no longer valid', async () => {
    const account = {
      id: 3,
      userToken: '1234',
      tokenExpiration: Date.now() - 200
    }

    mockFindOne.mockReturnValue(account)

    const token = Buffer.from(JSON.stringify(account)).toString('base64')
    const password = '12345678910'

    const result = await resetUserPassword(token, password)
    expect(result).toEqual(Error('token is no longer valid'))
  })
  it('should update database with encrypted password', async () => {
    const account = {
      id: 4,
      userToken: '1234',
      tokenExpiration: Date.now() + 200, 
      update: jest.fn()
    }

    mockFindOne.mockReturnValue(account)

    const token = Buffer.from(JSON.stringify(account)).toString('base64')
    const password = '12345678910'
  
    await resetUserPassword(token, password)
    expect(account.update.mock.calls.length).toEqual(1)
  })
})
