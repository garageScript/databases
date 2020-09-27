const {
  sendPasswordResetEmail,
  signUp,
  logIn,
  resetUserPassword,
} = require("../../lib/users");

const logger = require("../../lib/log")(__filename);
const db = require("../../sequelize/db");
const pgModule = require("../../database/postgres/pg");
const es = require("../../database/elasticsearch/elastic");
const routes = {};

routes.resetPasswordEmail = async (req, res) => {
  const email = req.body.email;
  if (!email) {
    return res.status(400).json({ error: { message: "invalid input" } });
  }
  const query = { where: { email: email } };
  const { Accounts } = db.getModels();
  const userAccount = await Accounts.findOne(query);
  if (!userAccount) {
    return res
      .status(400)
      .json({ error: { message: "Account does not exist" } });
  }
  logger.info(
    `User account found for user ${userAccount.id}, sending email now`
  );
  try {
    const account = await sendPasswordResetEmail(userAccount);
    logger.info(`user reset password email sent to user ${userAccount.id}`);
    return res.status(200).json({ ...account.dataValues, password: null });
  } catch (err) {
    logger.error(`Could not send email to user ${userAccount.id}`);
    return res
      .status(500)
      .json({ error: { message: "Email delivery failed. Please try again" } });
  }
};

routes.createUser = async (req, res) => {
  const userInfo = {
    email: req.body.email,
  };
  try {
    const account = await signUp(userInfo);
    logger.info("Succeded creating user account", userInfo.email);
    return res.status(200).json({ ...account.dataValues });
  } catch (err) {
    logger.error("Creating user failed", userInfo.email, err);
    return res.status(400).json({ error: { message: err.message } });
  }
};

routes.createAnonUser = async (req, res) => {
  try {
    const account = await signUp({ email: null });
    logger.info("Succeded creating anonymous user account", account.id);
    if (req.params.database === "Postgres") {
      await pgModule.createPgAccount(account);
      logger.info("Creating anonymous postgres account suceeded");
      return res.json(account);
    }
    if (req.params.database === "Elasticsearch") {
      await es.createAccount(account);
      logger.info("Creating anonymous elasticsearch account suceeded");
      return res.json(account);
    }
    return res.json({ ...account.dataValues, password: null });
  } catch (err) {
    logger.error("Creating anonymous user failed", err);
    return res.status(400).json({ error: { message: err.message } });
  }
};

routes.deleteUser = async (req, res) => {
  if (!req.params.id) {
    logger.info("user id was not provided");
    return res
      .status(400)
      .json({ error: { message: "user id was not provided" } });
  }
  const { Accounts } = db.getModels();
  try {
    const account = await Accounts.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!account) {
      logger.info("Cannot find user", req.params.id);
      return res.status(404).json({ error: { message: "Cannot find user" } });
    }
    if (account.id !== req.session.userid) {
      logger.error(
        "Username does not match to cookie",
        account.id,
        req.session.userid
      );
      return res
        .status(403)
        .json({ error: { message: "Username does not match to cookie" } });
    }
    await account.destroy();
    logger.info("Succeded deleting user account", req.params.id);
    return res.status(200).json({ ...account.dataValues, password: null });
  } catch (err) {
    logger.error("Deleting user failed", req.params.id, err);
    res
      .status(500)
      .json({ error: { message: "Deleting user failed. Please try again" } });
  }
};

routes.loginUser = async (req, res) => {
  const userInfo = {
    email: req.body.email,
    password: req.body.password,
  };
  try {
    const account = await logIn(userInfo);
    req.session.userid = account.id;
    req.session.email = account.email;
    logger.info("Logged in", account.email);
    return res.status(200).json({ ...account.dataValues, password: null });
  } catch (err) {
    logger.info(err);
    return res
      .status(500)
      .json({ error: { message: "Login user failed. Please try again" } });
  }
};

routes.logoutUser = (req, res) => {
  req.session.userid = "";
  req.session.email = "";

  logger.info("user logged out");
  return res.status(200).json({
    message: `Logout succeeded`,
  });
};

routes.userResetPassword = async (req, res) => {
  const token = req.body.token;
  const password = req.body.password;

  try {
    const account = await resetUserPassword(token, password);
    logger.info("User password reset for", account.email);
    req.session.userid = account.id;
    req.session.email = account.email;
    return res.status(200).json({ ...account.dataValues, password: null });
  } catch (err) {
    logger.error("user reset password error:", err);
    return res.status(500).json({
      error: { message: "Reset user password failed. Please try again" },
    });
  }
};

routes.createDatabase = async (req, res) => {
  let user;
  if (!req.session.userid) {
    logger.info("User must be signed in to create database");
    return res.status(403).json({
      error: { message: "You must be signed in to create a database" },
    });
  } else {
    const { Accounts } = db.getModels();
    const user = await Accounts.findOne({
      where: { id: req.session.userid },
    });
  }
  try {
    if (req.params.database === "postgres") {
      await pgModule.createPgAccount(user);
      return res
        .status(200)
        .json({ success: { message: "Create Postgres Database success" } });
    }
    if (req.params.database === "elastic") {
      await es.createAccount(user);
      return res.status(200).json({
        success: { message: "Create Elasticsearch Database success" },
      });
    }
    return res
      .status(400)
      .json({ error: { message: "You must specify database to create" } });
  } catch (err) {
    logger.error("Error with creating database:", err);
    return res
      .status(501)
      .json({ error: { message: "Database creation was not implemented" } });
  }
};

module.exports = routes;
