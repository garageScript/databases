jest.mock('../sequelize/db')
const db = require('../sequelize/db')

const dataValues = {
    username: 'testuser',
    password: 'abcd1234',
    email: 'test.user@databases.com'
}
db.start = () => {}
db.getModels = () => {
    return {
        Accounts: {
            findOne: () => {
                return {
                    dataValues: dataValues
                }
            }
        }
    }
}

const logIn = require('./users').logIn

describe('Validates user logIn', () => {
  it("function should reject if username contains invalid chars", () => {
    const obj = {
      username: '1234@gmail.com',
      email: '1234@gmail.com',
      password: 'password'
    }
    return expect(logIn(obj)).resolves.toEqual({
      errors: [ "username cannot contain non-alphanumeric characters" ]
    })
  })
  it("function should reject if email is invalid", () => {
    const obj = {
      username: '1234@gmail.com',
      email: '1234@gmail',
      password: 'password'
    }
    return expect(logIn(obj)).resolves.toEqual({
      errors: [ "email must be a valid email" ]
    })
  })
  it("function should reject if username doesn't exist", () => {
    const obj = {
      email: '1234@gmail.com',
      password: 'password'
    }
    return expect(logIn(obj)).resolves.toEqual({
      errors: [ 'username is a required field' ]
    })
  })
  it("function should reject if password too short", () => {
    const obj = {
      email: '1234@gmail.com',
      password: '123'
    }
    return expect(logIn(obj)).resolves.toEqual({
      errors: [ 'password must be at least 8 characters' ]
    })
  })
  it("function should reject if password doesn't exist", () => {
    const obj = {
      email: '1234@gmail.com',
    }
    return expect(logIn(obj)).resolves.toEqual({
      errors: [ 'password is a required field' ]
    })
  })
})



describe('Log in', () => {
    it("should throw error if password doesn't match", () => {
        const obj = {
            username: 'testuser',
            password: '1q2w3e4r',
            email: 'test.user@databases.com'
        }
        expect(logIn(obj)).rejects.toThrow()
    })
    it("should return user information if it logs in successfully", () => {
        const obj = {
            username: 'testuser',
            password: 'abcd1234',
            email: 'test.user@databases.com'
        }
        logIn(obj).then((result) => {
            expect(result).toEqual(dataValues)
        })
    })
})