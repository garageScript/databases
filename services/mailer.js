const mailgun = require('mailgun-js')({ apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN })
require('dotenv').config()

const mailgunModule = {}

mailgunModule.sendEmail = async (req, res) => {    
    try {
      await mailgun.messages().send({
        from: process.env.SENDER_EMAIL,
        to: req.params.mail,
        subject: 'Congratulations! You are approved to join C0d3.com',
        html: '<h1>Congratulations! Confirm your E-Mail with C0D3</h1><button>Confirm</button>'
      }, (error) => {
        if (error) {
          console.log(`error sending email ${error}`)
        }
      })
    } catch (error) {
      console.log(`mailgun did not send email successful ${error}`)
    }
}

module.exports = mailgunModule