const express = require('express')
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

