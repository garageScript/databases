const yup = require('yup')

const users = {}

const schema = yup.object().shape({
  username: yup.string().required().matches(/^[0-9a-zA-Z]+$/, "username cannot contain non-alphanumeric characters"),
  email: yup.string().required().email(),
  password: yup.string().required().min(8)
});

users.signUp = (userInfo) => {
  return schema.validate(userInfo).catch((err) => { return {
      errors: err.errors
    }
  })
} 

module.exports = users

