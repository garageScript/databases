const { Sequelize, DataTypes } = require('sequelize')
const logger = require('../lib/log')(__filename)
require('dotenv').config()

let sequelize
const dbModule = {}

dbModule.start = async ()=>{
  try{
    sequelize = new Sequelize(process.env.DATABASE, process.env.USERNAME, process.env.PASSWORD, {
      host: process.env.HOST || 'localhost', 
      dialect: 'postgres',
      pool: {
        max: 5,
        min: 0,
        idle: 10000
      }
    })
    sequelize.define('account', {
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
  }catch(err){
    logger.error(err)
    throw new Error('failed to authenticate sequelize account')
  }
}

dbModule.update = async ()=>{
  return sequelize.sync({alter: true})
}

dbModule.close = ()=>{
  return sequelize.close()
}

module.exports = dbModule
