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
const arangoModule = require("../../database/arango/arango");
const routes = {};

routes.resetPasswordEmail = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: { message: "invalid input" } });
  }
  const { Accounts } = db.getModels();
  const query = { where: { email } };
  const userAccount = await Accounts.findOne(query);
  if (!userAccount) {
    return res
      .status(400)
      .json({ error: { message: "Account does not exist" } });
  }
  const { id } = userAccount;
  logger.info(`User account found for user ${id}, sending email now`);
  try {
    const account = await sendPasswordResetEmail(userAccount);
    logger.info(`user reset password email sent to user ${id}`);
    return res.json({ ...account.dataValues, password: null });
  } catch (err) {
    logger.error(`Could not send email to user ${id}`);
    return res
      .status(500)
      .json({ error: { message: "Email delivery failed. Please try again" } });
  }
};

routes.createUser = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: { message: "Email is required" } });
  }
  const userInfo = { email };
  try {
    const account = await signUp(userInfo);
    logger.info("Succeded creating user account", email);
    res.json({ ...account.dataValues });
  } catch (err) {
    logger.error("Creating user failed", email, err);
    const message = err.toString().includes("SequelizeUniqueConstraintError")
      ? "This account already exists."
      : err.toString();

    return res.status(400).json({ error: { message } });
  }
};

routes.deleteUser = async (req, res) => {
  const { id } = req.params;
  const { userid } = req.session;

  if (!id) {
    logger.info("user id was not provided");
    return res
      .status(400)
      .json({ error: { message: "user id was not provided" } });
  }
  try {
    const { Accounts } = db.getModels();
    const account = await Accounts.findOne({ where: { id } });
    if (!account) {
      logger.info("Cannot find user", id);
      return res.status(404).json({ error: { message: "Cannot find user" } });
    }
    if (account.id !== userid) {
      logger.error("Username does not match to cookie", account.id, userid);
      return res
        .status(403)
        .json({ error: { message: "Username does not match to cookie" } });
    }
    await account.destroy();
    logger.info("Succeded deleting user account", id);
    return res.json({ ...account.dataValues, password: null });
  } catch (err) {
    logger.error("Deleting user failed", id, err);
    return res
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
    const { id, email, dataValues } = account;
    req.session.userid = id;
    req.session.email = email;
    logger.info("Logged in", email);
    return res.json({ ...dataValues, password: null });
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
  return res.json({ message: `Logout succeeded` });
};

routes.userResetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    const account = await resetUserPassword(token, password);
    const { id, email, dataValues } = account;
    logger.info("User password reset for", email);
    req.session.userid = id;
    req.session.email = email;
    return res.json({ ...dataValues, password: null });
  } catch (err) {
    logger.error("user reset password error:", err);
    return res.status(500).json({
      error: { message: "Reset user password failed. Please try again" },
    });
  }
};

const createDatabaseAccount = {
  Postgres: pgModule.userHasPgAccount,
  Elasticsearch: es.createAccount,
  Arango: arangoModule.createAccount,
};

routes.createDatabase = async (req, res) => {
  const { email, userid } = req.session;
  const { database } = req.params;

  if (!database) {
    return res
      .status(400)
      .json({ error: { message: "You must specify database to create" } });
  }
  try {
    const { Accounts } = db.getModels();
    const user = !email
      ? await signUp({ email: null })
      : await Accounts.findOne({ where: { id: userid } });
    !email && logger.info("Succeded creating anonymous user account", user.id);
    await createDatabaseAccount[database](user);
    return res.json({ ...user.dataValues, password: null });
  } catch (err) {
    logger.error("Error with creating database:", err);
    return res
      .status(501)
      .json({ error: { message: "Database creation was not implemented" } });
  }
};

module.exports = routes;
