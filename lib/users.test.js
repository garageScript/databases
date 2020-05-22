jest.mock('mailgun-js')
jest.mock('../sequelize/db')
jest.mock('../services/mailer')

const bcrypt = require('bcrypt')
const db = require('../sequelize/db')
const users = require('./users')
const email = require('../services/mailer')

const signUp = users.signUp
const logIn = users.logIn
const sendPasswordResetEmail = users.sendPasswordResetEmail

const mockFindOne = jest.fn()
const mockCreateAccount = jest.fn()
email.sendPasswordResetEmail = jest.fn()

const genUserInfoWithPw = async (password) => {
  return {
    username: 'testuser',
    password: await bcrypt.hash(password, 10),
    email: 'test.user@databases.com'
  }
}

db.getModels = () => {
  return {
    Accounts: {
      findOne: mockFindOne,
      create: mockCreateAccount
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
    mockCreateAccount.mockReturnValue({ id: 5 })

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
  it('should send a user email confirmation', async () => {
    const obj = {
      id: 4,
      username: 'Batman',
      email: 'Batman',
      password: 'Batman'
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
    return expect(logIn(obj)).resolves.toEqual(dataValues)
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
