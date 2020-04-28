const mailgun = require('mailgun-js');
const logger = require('../lib/log')(__filename)
require('dotenv').config()

const mg = mailgun({apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN});

const sendConfirmationEmail = () => {    
    const data = {
        from: process.env.SENDER_EMAIL,
        to: process.env.RECEIVER_EMAIL,
        subject: 'Congratulations!',
        text: 'Welcome to C0D3',
        html: "<h1>Confirm your E-mail</h1><button>Confirm</button>"
    };
    
    return mg.messages().send(data).then((returnedData) => {
        logger.info('results')
    }).catch((error) => {
        logger.error('error')
    })
}
sendConfirmationEmail()

module.exports = sendConfirmationEmail