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
    app.get('/', (req,res) => {res.send('hello')})

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

