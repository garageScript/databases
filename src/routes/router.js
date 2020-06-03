const express = require('express')
const router = express.Router() 

router.get('/', (req, res) => {
  res.redirect('/test')
})

router.get('/test', (req, res) => {
  res.send('<h1>Testing the server get method</h1>')
})

router.post('/api/notifications', async (req, res) => {
  const email = req.body.email
  logger.info('request received to send notification')
  if (!email) {
    return res.status(400).json({error: {message: "invalid input"}})
  }
  logger.info('user email is', email)
  const {Accounts} = db.getModels()
  const userAccount = await Accounts.findOne({
    where: {
      email: email
    }
  })
  if (!userAccount) {
    return res.status(400).json({error: {message: "account does not exist"}})
  }
    logger.info(`user account found for user ${userAccount.id}, sending email now`)
  try {
    sendPasswordResetEmail(userAccount) 
    logger.info(`user resent password email sent to user ${userAccount.id}`)
    return res.status(200).send('success')
  } catch (err) {
    logger.error(`Could not send email to user ${userAccount.id}`)
    return res.status(500).json({ error: {message: 'Email delivery failed. Please try again'}})
  }
})

module.exports = router


