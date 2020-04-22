const { Sequelize, DataTypes } = require('sequelize')
const logger = require('../lib/log')(__filename)
require('dotenv').config()

let sequelize
const dbModule = {}

dbModule.start = async ()=>{
  try{
    sequelize = new Sequelize(process.env.DATABASE, process.env.USERNAME, process.env.PASSWORD, {
      host: process.env.HOST, 
      dialect: 'postgres',
      pool: {
        max: 5,
        min: 0,
        idle: 10000
      }
    })
    await sequelize.define('account', {
      username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      dbPassword: {
        type: DataTypes.STRING
      },
      emailConfirmation: {
        type: DataTypes.STRING
      },
      passwordReset: {
        type: DataTypes.STRING
      },
      databases: {
        type: DataTypes.TEXT
      }
    })
    await sequelize.authenticate()
    logger.log('starting sequelize server')
  }catch(err){
    logger.error(err)
    throw new Error('failed to authenticate sequelize account')
  }
}

dbModule.update = async ()=>{
  logger.log('updating sequelize server')
  return sequelize.sync({alter: true})
}

dbModule.close = ()=>{
  logger.log('closing sequelize server')
  return sequelize.close()
}

module.exports = dbModule
