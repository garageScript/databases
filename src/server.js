const express = require('express')
const logger = require('../lib/log')(__filename)
const dbModule = require('../sequelize/db')
const {resetPassword} = require('./routes/userRoutes')

let server = null
let app = null

const getApp = () => {
  return app
}

const startServer = async (portNumber) => {
  await dbModule.start()
  return new Promise((resolve, reject) => {
    app = express()
    app.use(express.json())

    app.post('/api/notifications', resetPassword)

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

