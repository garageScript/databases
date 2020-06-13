const express = require('express')
const logger = require('../lib/log')(__filename)
const dbModule = require('../sequelize/db')
const session = require('express-session')
const {resetPassword, createUser, deleteUser, loginUser, logoutUser,updateDBPassword} = require('./routes/userRoutes')

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
    app.patch('/api/users/:id',updateDBPassword)
    app.post('/api/notifications', resetPassword)
    app.post('/api/users', createUser)
    app.post('/api/session', loginUser)
    app.delete('/api/users/:id', deleteUser)
    app.delete('/api/session/:id', logoutUser)

    server = app.listen(portNumber, () => {
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

