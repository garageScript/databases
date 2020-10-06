const db = require("../../sequelize/db");
const es = require("../../database/elasticsearch/elastic");
const pg = require("../../database/postgres/pg");
const arangoModule = require("../../database/arango/arango");
require("dotenv").config();
const routes = {};

// This is the 'host' url for a person's database credentials
const dbHostHash = {
  Postgres: "learndatabases.dev",
  Elasticsearch: "elastic.learndatabases.dev",
  Arango: process.env.ARANGO_URL,
};

const checkAccount = {
  Postgres: ({ username }) => pg.userHasPgAccount(username),
  Elasticsearch: (user) => es.checkAccount(user),
  Arango: ({ username }) => arangoModule.checkIfDatabaseExists(username),
};

// If you are here because you are implementing another database, then
// just add to the two hashtables above! No need to touch down here.
routes.database = async (req, res) => {
  const { email, userid } = req.session;
  const { database } = req.params;
  const { Accounts } = db.getModels();

  const user = userid ? await Accounts.findOne({ where: { id: userid } }) : {};
  const { username, dbPassword } = user;
  const renderData = { email, username, dbPassword, database };
  renderData.dbHost = dbHostHash[database];
  renderData.dbExists = username ? await checkAccount[database](user) : false;

  res.render("tutorial", renderData);
};

module.exports = routes;
