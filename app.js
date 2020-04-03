const express = require('express');
const Mailgun = require('mailgun-js')

const app = express();

const api_key = '317a0f64411bd75d7598da6be916803b-46ac6b00-50f5a2ee';

const domain = 'sandbox47881c22500a4bf7a21f621e5bc25800.mailgun.org';

const from_who = 'pvalderama@gmail.com';


app.get('/invoice/:mail', (req, res) => {
    const path = require('path');
    const fp = path.join(__dirname, 'template.txt')

    const mailgun = new Mailgun({apiKey: api_key, domain: domain});

    const data = {
        from: from_who,
        to: req.params.mail,
        subject: 'Confirm E-mail for C0D3',
        text: 'Confirm E-mail',
        attachment: fp
    };
    mailgun.messages().send(data, (error, body) => {
        if(error) {
            res.render('error', {error: error});
        } else {
            res.send('Attachment is on its way');
            console.log('attachment sent', fp);
        }
    })
})

app.listen(3030);