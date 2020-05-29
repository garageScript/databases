const express = require('express')
const db = require('../sequelize/db')
const {sendPasswordResetEmail} = require('../lib/users')

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

