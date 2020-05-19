const users = require('./users')
const bcrypt = require('bcrypt')
jest.mock('../sequelize/db')
const db = require('../sequelize/db')

const signUp = users.signUp
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
