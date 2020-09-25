const db = require("../../sequelize/db");
const es = require("../../database/elasticsearch/elastic");
const pg = require("../../database/postgres/pg");

const routes = {};

routes.database = async (req, res) => {
  renderData = {
    email: null,
    username: null,
    dbPassword: null,
    dbExists: false,
    database: req.params.database,
  };
  if (req.params.database === "Postgres") {
    renderData.dbHost = "learndatabases.dev";
  }
  if (req.params.database === "Elasticsearch") {
    renderData.dbHost = "elastic.learndatabases.dev";
  }
  if (req.session.userid) {
    const { Accounts } = db.getModels();
    const userAccount = await Accounts.findOne({
      where: {
        id: req.session.userid,
      },
    });
    if (req.params.database === "Postgres") {
      renderData.dbExists = await pg.userHasPgAccount(userAccount.username);
    }
    if (req.params.database === "Elasticsearch") {
      renderData.dbExists = await es.checkAccount(userAccount);
    }
    renderData.email = req.session.email;
    renderData.username = userAccount.username;
    renderData.dbPassword = userAccount.dbPassword;
    renderData.database = req.params.database;
  }
  res.render("tutorial", renderData);
};

module.exports = routes;
