const mailgun = require('mailgun-js');
const logger = require('../lib/log')
require('dotenv').config()

const mg = mailgun({apiKey: process.env.MAILGUN_API_KEY, domain: process.env.DOMAIN});

const sendConfirmationEmail = () => {
    const data = {
        from: process.env.SENDER_EMAIL,
        to: process.env.RECEIVER_EMAIL,
        subject: 'Congratulations!',
        text: 'Welcome to C0D3',
        html: "<h1>Confirm your E-mail</h1><button>Confirm</button>"
    };
    mg.messages().send(data, function(error, body){
        if(error){
            logger.error('email failed to send')
        }
        logger.info('email successfully sent')
    })
}

module.exports = sendConfirmationEmail