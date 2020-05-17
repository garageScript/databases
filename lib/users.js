const logger = require('./log')(__filename)
const yup = require('yup')
const db = require('../sequelize/db')

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

users.logIn = async (userInfo) => {
  try {
    schema.validate(userInfo)
  }
  catch (err) {
    logger.error(err)
    return {
      errors: err.errors
    }
  }

  const {Accounts} = db.getModels()
  const account = await Accounts.findOne({
    where: {
      username: userInfo.username
    }
  })

  if (!accont) {
    logger.error('User not found', userInfo.username)
    throw new Error('User not found')
  }

  if (account.dataValues.password !== userInfo.password) {
    logger.error('Password does not match')
    throw new Error('Password does not match')
  }

  return account.dataValues
}

// users.logIn({
  // username: 'testuser',
  // password: 'abcd1234',
  // email: 'test.user@databases.com'
// })

module.exports = users

