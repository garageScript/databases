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
