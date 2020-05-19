const logger = require('./log')(__filename)
const yup = require('yup')
const db = require('../sequelize/db')
const bcrypt = require('bcrypt')

const users = {}

const schema = yup.object().shape({
  username: yup.string().required().matches(/^[0-9a-zA-Z]+$/, "username cannot contain non-alphanumeric characters"),
  email: yup.string().required().email(),
  password: yup.string().required().min(8)
});

users.signUp = async (userInfo) => {
  return schema.validate(userInfo).catch((err) => { return {
      errors: err.errors
    }
  })
} 

users.logIn = async (userInfo) => {
  if (!userInfo.username && !userInfo.email) {
    logger.info('invalid userInfo for Login', userInfo)
    throw new Error('User input is invalid')
  }

  const {Accounts} = db.getModels()
  const account = await Accounts.findOne({
    where: {
      username: userInfo.username
    }
  })

  if (!account) {
    logger.info('User not found', userInfo.username)
    throw new Error('User not found')
  }

  const pwMatches = await bcrypt.compare(userInfo.password, account.dataValues.password)
  if (!pwMatches) {
    logger.info('Password does not match')
    throw new Error('Password does not match')
  }

  return account.dataValues
}

module.exports = users

