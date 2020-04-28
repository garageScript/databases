const mailgun = require('mailgun-js');
const logger = require('../lib/log')(__filename)
require('dotenv').config()

const mg = mailgun({apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN});

const mgModule = {}

mgModule.sendConfirmationEmail = (receiver, token) => {    
    const link = `https://learndatabases.dev/emailConfirmation/${token}`
    const data = {
        from: process.env.SENDER_EMAIL,
        to: receiver,
        subject: 'Congratulations!',
        text: 'Welcome to C0D3',
        html: `
        <h1> Confirm your Email </h1>
        <p>
          <a href="${link}">Click Here</a>
        </p>
        <p> Or visit this link: <a href="${link}">${link}</a></p>
        `
    };
    
    return mg.messages().send(data).then((returnedData) => {
        logger.info('Confirmation Email successfully sent', returnedData)
    }).catch((error) => {
        logger.error('Confirmation Email Error:', error)
    })
}

module.exports = mgModule