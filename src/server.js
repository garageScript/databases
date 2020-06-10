const express = require('express')
const logger = require('../lib/log')(__filename)
const dbModule = require('../sequelize/db')
const session = require('express-session')
const {resetPassword, createUser, deleteUser} = require('./routes/userRoutes')

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
    app.use(session({
      secret: 'I L0V3 DATABASES',
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: true,
        maxAge: 1000*60*5
      }
    }))

    app.post('/api/notifications', resetPassword)
    app.post('/api/users', createUser)
    app.delete('/api/users/:id', deleteUser)

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

