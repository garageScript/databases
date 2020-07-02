const { Sequelize, DataTypes } = require('sequelize')
const logger = require('../lib/log')(__filename)
require('dotenv').config()

let sequelize
const dbModule = {}

const models = {}

dbModule.start = async () => {
  logger.info('starting sequelize server')
  try {
    sequelize = new Sequelize(process.env.DATABASE, process.env.PG_USER, process.env.PASSWORD, {
      host: process.env.HOST,
      dialect: 'postgres',
      pool: {
        max: 5,
        min: 0,
        idle: 10000
      }
    })
    models.Accounts = await sequelize.define('account', {
      username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      password: {
        type: DataTypes.STRING
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      dbPassword: {
        type: DataTypes.STRING
      },
      passwordReset: {
        type: DataTypes.STRING
      },
      tokenExpiration: {
        type: DataTypes.BIGINT
      },
      databases: {
        type: DataTypes.TEXT
      }
    })
    logger.info('sequelize authenticating...')
    await sequelize.authenticate()
    logger.info('updating sequelize server...')
    await sequelize.sync({ alter: !!process.env.ALTER_DB })
  } catch (err) {
    logger.error(err)
    throw new Error('failed to authenticate sequelize account')
  }
}

dbModule.close = () => {
  logger.info('closing sequelize server')
  return sequelize.close()
}

dbModule.getModels = () => {
  logger.info('getting models')
  return models
}

module.exports = dbModule
