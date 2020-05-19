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
db.getModels = () => {
    return {
        Accounts: {
            findOne: mockFindOne
        }
    }
}

const signUp = users.signUp
const logIn = users.logIn

beforeEach(() => {
  jest.clearAllMocks()
})

describe('Validates user signup', () => {
  it("function should reject if username contains invalid chars", () => {
    const obj = {
      username: '1234@gmail.com',
      email: '1234@gmail.com',
      password: 'password'
    }
    return expect(signUp(obj)).resolves.toEqual({
      errors: [ "username cannot contain non-alphanumeric characters" ]
    })
  })
  it("function should reject if email is invalid", () => {
    const obj = {
      username: '1234@gmail.com',
      email: '1234@gmail',
      password: 'password'
    }
    return expect(signUp(obj)).resolves.toEqual({
      errors: [ "email must be a valid email" ]
    })
  })
  it("function should reject if username doesn't exist", () => {
    const obj = {
      email: '1234@gmail.com',
      password: 'password'
    }
    return expect(signUp(obj)).resolves.toEqual({
      errors: [ 'username is a required field' ]
    })
  })
  it("function should reject if password too short", () => {
    const obj = {
      email: '1234@gmail.com',
      password: '123'
    }
    return expect(signUp(obj)).resolves.toEqual({
      errors: [ 'password must be at least 8 characters' ]
    })
  })
  it("function should reject if password doesn't exist", () => {
    const obj = {
      email: '1234@gmail.com',
    }
    return expect(signUp(obj)).resolves.toEqual({
      errors: [ 'password is a required field' ]
    })
  })
})

describe('Log in', () => {
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