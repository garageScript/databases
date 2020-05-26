const logger = require('./log')(__filename)
const yup = require('yup')
const db = require('../sequelize/db')
const bcrypt = require('bcrypt')
const users = {}

const schema = yup.object().shape({
  username: yup.string().required().matches(/^[0-9a-zA-Z]+$/, 'username cannot contain non-alphanumeric characters'),
  email: yup.string().required().email(),
  password: yup.string().required().min(8)
})

users.signUp = async (userInfo) => {
  try {
    await schema.validate(userInfo)
  } catch (err) {
    throw new Error(err)
  }

  const { username, email, password } = userInfo
  const { Accounts } = db.getModels()
  const userAccount = await Accounts.findOne({
    where: {
      username: username
    }
  })
  if (userAccount) {
    logger.info('this account already exists', username, userAccount.email, email)
    throw new Error('this account already exists')
  }
  return Accounts.create({
    username: username,
    email: email,
    password: await bcrypt.hash(password, 10)
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

users.setDBPassword = async (userInfo) => {
  const {Accounts} = db.getModels()
  try {
    Accounts.update({
      dbPassword: userInfo.dbPassword
    }, {
      where: {
        username: userInfo.username
      }
    })
  } catch (err) {
    logger.info('Failed to set DB password', userInfo.username, err)
    throw new Error('Failed to set DB password')
  }
  logger.info('DB password has set successfully', userInfo.username)
}

module.exports = users
