const mailgun = require('mailgun-js')
const logger = require('../lib/log')(__filename)
const getEnvVar = require('../lib/getEnvVar')

const mg = mailgun(getEnvVar('mailgun'))

const mgModule = {}

mgModule.sendPasswordResetEmail = (receiver, token, userid) => {
  const link = `https://learndatabases.dev/setPassword/${userid}/${token}`
  const data = {
    from: 'admin@learndatabases.dev',
    to: receiver,
    subject: 'Congratulations!',
    text: 'Welcome to learndatabases.dev',
    html: `
        <h1> Learn Databases </h1>
        <h3> Set your password <a href="${link}">Here</a></h3>
        <p> Or visit this link: <a href="${link}">${link}</a></p>
        `
  }
  return mg.messages().send(data).then((returnedData) => {
    logger.info('Confirmation Email successfully sent', returnedData)
  }).catch((err) => {
    logger.error('Confirmation Email Error:', err)
    return err
  })
}

module.exports = mgModule
