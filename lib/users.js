const yup = require('yup')
const db = require('../sequelize/db')
const users = {}

const schema = yup.object().shape({
  username: yup.string().required().matches(/^[0-9a-zA-Z]+$/, 'username cannot contain non-alphanumeric characters'),
  email: yup.string().required().email(),
  password: yup.string().required().min(8)
})

users.signUp = async (userInfo) => {
  try {
    await schema.validate(userInfo)
    await db.start()
    const {Accounts} = db.getModels()
  } catch (err) {
    return {
      errors: err.errors
    }
  }
}

module.exports = users
