const { Sequelize, DataTypes } = require('sequelize')

let sequelize
const dbModule = {}

dbModule.start = ()=>{
  sequelize = new Sequelize(`${process.env.DATABASE}`, `${process.env.USERNAME}`, `${process.env.PASSWORD}`, {
    host: process.env.HOST || 'localhost', 
    dialect: process.env.DIALECT || 'postgres',
    pool: {
      max: 5,
      min: 0,
      idle: 10000
    }
  })
  return sequelize.authenticate()
}

dbModule.Account = ()=>{
  return sequelize.define('account', {
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
}

dbModule.update = ()=>{
  return sequelize.sync({alter: true})
}

dbModule.close = ()=>{
  return sequelize.close()
}

module.exports = dbModule
