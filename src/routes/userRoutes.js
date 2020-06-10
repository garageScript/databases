const {sendPasswordResetEmail} = require('../../lib/users')
const logger = require('../../lib/log')(__filename)
const db = require('../../sequelize/db')
const routes = {}

routes.resetPassword = async (req, res) => {
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
    return res.status(400).json({error: {message: "Account does not exist"}})
  }

  logger.info(`User account found for user ${userAccount.id}, sending email now`)
  try {
    await sendPasswordResetEmail(userAccount)

    logger.info(`user reset password email sent to user ${userAccount.id}`)
    return res.status(200).json({success: {message: "Email sucessfully sent"}})
  } catch (err) {
    logger.error(`Could not send email to user ${userAccount.id}`)
    return res.status(500).json({ error: {message: 'Email delivery failed. Please try again'}})
  }
}

module.exports = routes

