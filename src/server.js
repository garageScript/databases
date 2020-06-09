const express = require('express')
const dbModule = require('../sequelize/db')
const logger = require('../lib/log')(__filename)

let server = null
let app = null

const getApp = () => {
  return app
}

const startServer = async (portNumber) => {
  await dbModule.start()
  return new Promise((resolve, reject) => {
    app = express()
    server =  app.listen(portNumber, () => {
      resolve(app)
      logger.info(`Listening on portNumber ${portNumber}`)
    })
  })
}

const stopServer = () => {
  return new Promise((resolve, reject) => {
    dbModule.close()
    logger.info("DB has been closed")
    server.close(() => {
      logger.info("The server has been closed")
      resolve()
    })
  })
}

module.exports = {
  startServer,
  stopServer,
  getApp
}

