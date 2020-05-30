const logger = require('../lib/log')(__filename)
const express = require('express')
const db = require('../sequelize/db')
const {sendPasswordResetEmail, signUp} = require('../lib/users')

let server = null
let app = null

const getApp = () => {
  return app
}

const startServer = (portNumber) => {
  return new Promise((resolve, reject) => {
    app = express()

    app.use(express.json()) // for parsing application/json

    app.post('/api/notification', async (req, res) => {
      const email = req.body.email
      if (!email) {
        return res.status(400).json({error: {message: "invalid input"}})
      }
      const {Accounts} = db.getModels()
      const userAccount = await Accounts.findOne({
        where: {
          email: email
        }
      })
      if (!userAccount) {
        return res.status(400).json({error: {message: "account does not exist"}})
      }
      try {
        sendPasswordResetEmail(userAccount) 
        return res.status(200).send('success')
      } catch (err) {
       return res.status(500).json({ error: {message: 'Email delivery failed. Please try again'}})
      }
    })

    app.post('/api/users', async (req, res) => {
      const userInfo = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
      }
      if (!userInfo.username || !userInfo.email || !userInfo.password) {
        logger.info("invalid input")
        return res.status(400).json({error: {message: "invalid input"}})
      }
      try {
        await signUp(userInfo)
        return res.status(200).send('Succeded creating user account')
      } catch (err) {
        logger.error("Creating user failed", err)
        res.status(500).json({error: {message: 'Creating user failed. Please try again'}})
      }
    })

    app.delete('/api/users/:id', async (req, res) => {
      if (!req.params.id) {
        logger.info("user id was not provided")
        return res.status(400).json({error: {message: "user id was not provided"}})
      }
      const {Accounts} = db.getModels()
      try {
        const account = await Accounts.findOne({
          where: {
            id: req.params.id
          }
        })
        if (!account) {
          logger.info("Cannot find user", req.params.id)
          return
        }
        account.destroy()
        return res.status(200).send('Succeded deleting user account')
      } catch (err) {
        logger.error("Deleting user failed", err)
        res.status(500).json({error: {message: 'Deleting user failed. Please try again'}})
      }
    })

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

