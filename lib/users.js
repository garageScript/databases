const logger = require('./log')(__filename)
const yup = require('yup')
const db = require('../sequelize/db')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const email = require('../services/mailer')
const users = {}

const schema = yup.object().shape({
  username: yup.string().required().matches(/^[0-9a-zA-Z]+$/, 'username cannot contain non-alphanumeric characters'),
  email: yup.string().required().email(),
  password: yup.string().required().min(8)
})

users.sendPasswordResetEmail = async (userAccount) => {
  const buf = crypto.randomBytes(40)
  const randomToken = buf.toString('hex')

  console.log(userAccount, 'account')
  console.log(userAccount.id, 'account id')

  const account = {
    userid: userAccount.id,
    userToken: randomToken
  }

  const accountJSON = JSON.stringify(account)
  const encodedToken = Buffer.from(accountJSON).toString('base64')
  await email.sendPasswordResetEmail(userAccount.email, encodedToken)
}

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
  const newAccount = await Accounts.create({
    username: username,
    email: email,
    password: await bcrypt.hash(password, 10)
  })
  await users.sendPasswordResetEmail(newAccount)
  return newAccount
}

users.logIn = async (userInfo) => {
  if (!userInfo.username && !userInfo.email) {
    logger.info('invalid userInfo for Login', userInfo)
    throw new Error('User input is invalid')
  }

  const { Accounts } = db.getModels()
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
