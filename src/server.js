const express = require('express')
const logger = require('../lib/log')(__filename)
let server = null
let app = null

const getApp = () => {
  return app
}

const startServer = (portNumber) => {
  return new Promise((resolve, reject) => {
    app = express()
    server =  app.listen(portNumber, () => {
      resolve(app)
      logger.info(`Listening on portNumber ${portNumber}`)
    })
  })
}

const stopServer = () => {
  server.close()
  logger.info("The server has been closed")
}

module.exports = {
  startServer,
  stopServer,
  getApp
}

