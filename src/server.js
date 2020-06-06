const logger = require('../lib/log')(__filename)
const express = require('express')
const session = require('express-session')
const {createUser, deleteUser, loginUser} = require('./userRoutes')

let server = null
let app = null

const getApp = () => {
  return app
}

const startServer = (portNumber) => {
  return new Promise((resolve, reject) => {
    app = express()

    app.use(express.json()) // for parsing application/json
    app.use(session({
      secret: 'I L0V3 DATABASES',
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: true,
        maxAge: 1000*60*5
      }
    }))

    app.post('/api/users', createUser)
    app.post('/login', loginUser)
    app.delete('/api/users/:id', deleteUser)

   server = app.listen(portNumber, () => {
     resolve(app)
    console.log(`Listening on portNumber ${portNumber}`)
    })
  })
}

const stopServer = () => {
  server.close()
  console.log("The server has been closed")
}

module.exports = {
  startServer,
  stopServer,
  getApp
}

