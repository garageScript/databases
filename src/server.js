const express = require('express')
const dbModule = require('../sequelize/db')
const logger = require('../lib/log')(__filename)
const {patch} = require('./userRoutes')

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
    
    app.patch('/api/users/:id',patch)
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
