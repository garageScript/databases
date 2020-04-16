const Mailgun = require('mailgun-js');
require('dotenv').config()


//Your api key, from Mailgun’s Control Panel
const api_key = process.env.API_KEY

//Your domain, from the Mailgun Control Panel

const domain = process.env.DOMAIN

//Your sending email address
const from_who = process.env.FROM_WHO;

const mailgunModule = {}


mailgunModule.sendConfirmationEmail = (toEmail) => {

    //Settings
    
    let mailgun = new Mailgun({apiKey: api_key, domain: domain});
    let data = {
        from: from_who,
        to: toEmail,
        subject: 'Confirm your E-mail with C0D3',
        text: 'C0D3 confirmation e-mail',
        html: '<h1>Click to confirm your E-Mail</h1><button>Confirm</button>'
    };
    
    //Sending the email with attachment
    mailgun.messages().send(data, function (error, body) {
        if (error) {
            res.render('error', {error: error});
        } else {
            res.send("Email on its way");
            console.log("Email sent", fp);
        }
    });
}

module.exports = mailgunModule