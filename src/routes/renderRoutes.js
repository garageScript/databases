const db = require("../../sequelize/db");
const es = require("../../database/elasticsearch/elastic");
const pg = require("../../database/postgres/pg");

const routes = {};

routes.postgres = async (req, res) => {
  if (!req.session.email) {
    return res.render("postgres", {
      email: null,
      username: null,
      dbPassword: null,
      dbExists: false,
    });
  }
  const { Accounts } = db.getModels();
  const userAccount = await Accounts.findOne({
    where: {
      id: req.session.userid,
    },
  });
  const dbExists = await pg.userHasPgAccount(userAccount.username);
  res.render("postgres", {
    email: req.session.email,
    username: userAccount.username,
    dbPassword: userAccount.dbPassword,
    dbExists: dbExists,
  });
};

routes.elastic = async (req, res) => {
  if (!req.session.email) {
    return res.render("elastic", {
      email: null,
      username: null,
      dbPassword: null,
      dbExists: false,
    });
  }
  const { Accounts } = db.getModels();
  const userAccount = await Accounts.findOne({
    where: {
      id: req.session.userid,
    },
  });
  const dbExists = await es.checkAccount(userAccount);
  res.render("elastic", {
    email: req.session.email,
    username: userAccount.username,
    dbPassword: userAccount.dbPassword,
    dbExists: dbExists,
  });
};

module.exports = routes;
