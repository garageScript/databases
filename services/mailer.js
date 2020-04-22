require('dotenv').config()

const sendConfirmationEmail = () => {
    const mailgun = require('mailgun-js');
    const DOMAIN = process.env.DOMAIN;
    const mg = mailgun({apiKey: process.env.MAILGUN_API_KEY, domain: process.env.DOMAIN});
    const data = {
        from: process.env.SENDER_EMAIL,
        to: process.env.RECEIVER_EMAIL,
        subject: 'Congratulations!',
        text: 'Welcome to C0D3',
        html: "<h1>Confirm your E-mail</h1><button>Confirm</button>"
    };
    mg.messages().send(data, function(error, body){
        if(error){
            console.log(error)
        }
        console.log(body)
    })
}

module.exports = sendConfirmationEmail