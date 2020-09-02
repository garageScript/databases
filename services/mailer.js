const mailgun = require("mailgun-js");
const logger = require("../lib/log")(__filename);
const getEnvVar = require("../lib/getEnvVar");

const mg = mailgun(getEnvVar("mailgun"));

const mgModule = {};

mgModule.sendPasswordResetEmail = (receiver, token) => {
  const link = `https://learndatabases.dev/setPassword/${token}`;
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
            <button id="button" onclick="window.open('${link}')">Set my Password</button>
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
