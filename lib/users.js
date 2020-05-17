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

users.signUp = (userInfo) => {
  return schema.validate(userInfo).catch((err) => { return {
      errors: err.errors
    }
  })
} 

users.logIn = async (userInfo) => {
  try {
    await schema.validate(userInfo)
  }
  catch (err) {
    logger.info(err)
    return {
      errors: err.errors
    }
  }
  db.start()
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

  let pwMatches
  bcrypt.compare(account.dataValues.password, userInfo.password, (err, result) => {
    if (err) {
      logger.error('Encryption has failed', err)
      throw err
    }
    pwMatches = result
  })

  if (!pwMatches) {
    logger.info('Password does not match')
    throw new Error('Password does not match')
  }

  return account.dataValues
}

const obj = {
  username: 'testuser',
  password: 'abcd1234',
  email: 'test.user@databases.com'
}
users.logIn(obj)

module.exports = users

