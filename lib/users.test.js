const users = require('./users')

const signUp = users.signUp

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

jest.mock('../sequelize/db')
const bcrypt = require('bcrypt')
const db = require('../sequelize/db')

const genData = async (password) => {
  return {
    username: 'testuser',
    password: await bcrypt.hash(password, 10),
    email: 'test.user@databases.com'
  }
}

db.start = () => {}
const mockFindOne = jest.fn()
db.getModels = () => {
    return {
        Accounts: {
            findOne: mockFindOne
        }
    }
}

const logIn = users.logIn

beforeEach(() => {
    jest.clearAllMocks()
})

describe('Validates user logIn', () => {
  it("function should reject if username doesn't exist", () => {
    const obj = {
      email: '1234@gmail.com',
      password: 'password'
    }
    return expect(logIn(obj)).resolves.toEqual({
      errors: [ 'username is a required field' ]
    })
  })
})

describe('Log in', () => {
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
    const dataValues = await genData('abcd1234')
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
    const dataValues = await genData('abcd1234')
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