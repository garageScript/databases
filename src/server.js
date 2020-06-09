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
    app.set('view engine','ejs')
    app.use(express.json())
    app.get('/',(req,res)=>{
      const user ={name:'donnell'}
      res.render('welcome',{user})
    })

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

