const mailgun = require("mailgun-js");
const logger = require("../lib/log")(__filename);
require("dotenv").config();

const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN,
});

const mgModule = {};

mgModule.sendPasswordResetEmail = (receiver, token, hostname = "https://learndatabases.dev") => {
  const link = `${hostname}/setPassword/${token}`
  const data = {
    from: "admin@learndatabases.dev",
    to: receiver,
    subject: "Please set your password at LearnDatabases.dev",
    text: `You have requested a (re)set password token. Please set your password here: ${link}`,
    html: `
        <div id="container">
          <div style="font-size: 12px; text-align: left">LearnDatabases.dev</div>
          <hr>
          <div id="content">
            <p>You have requested a (re)set password token. The button below will redirect you to our website with an autheticated token. Please click the button and set your password.</p>
            <a href="${link}" target="_blank" id="button">Set my Password</a> ${hostname != "https://learndatabases.dev" ?
        "<h2>DEVELOPMENT MODE IS ON. This link will redirect you to your development server</h2>" : ""}
            <p><small><b style="color: red">Warning</b>: Anyone with access to this email has access to your account. Don't share this email with other people.</small></p> 
          </div>
        </div>
        <style>
          * {
            font-family: Arial, Helvetica, sans-serif;
            font-weight: normal;
            text-align: center;
          }
          b {
            font-weight: bold;
          }
          #container {
            max-width: 800px;
            min-width: 350px;
            margin: auto;
          }
          #content {
            padding-left: 4rem;
            padding-right: 4rem;
            padding-top: 1rem;
            padding-bottom: 1rem;
          }
          #button {
            display: inline-block;
            margin-top: 2rem;
            margin-bottom: 4rem;
            background-color: #3291FF;
            color: white;
            border: none;
            border-radius: 5px;
            height: 40px;
            width: 400px;
            line-height: 40px;
            font-size: 20px;
          }
          #button:hover {
            cursor: pointer;
            background-color: #0070F3;
          }
        </style>
        `,
  };
  return mg
    .messages()
    .send(data)
    .then((returnedData) => {
      logger.info("Confirmation Email successfully sent", returnedData);
    })
    .catch((err) => {
      logger.error("Confirmation Email Error:", err);
      return err;
    });
};

module.exports = mgModule;
