const db = require("../../sequelize/db");
const es = require("../../database/elasticsearch/elastic");
const pg = require("../../database/postgres/pg");
const arangoModule = require("../../database/arango/arango");
require("dotenv").config();
const routes = {};

// This is for when a person is running the app on their local machine.
const dev_dbHost = {
  Postgres: process.env.HOST,
  Elasticsearch: process.env.ES_HOST,
  Arango: process.env.ARANGO_URL,
};

// This is the 'host' url for a person's database credentials in prod.
const dbHost = {
  Postgres: "learndatabases.dev",
  Elasticsearch: "elastic.learndatabases.dev",
  Arango: "arangodb.learndatabases.dev",
};

const checkAccount = {
  Postgres: pg.userHasPgAccount,
  Elasticsearch: es.checkAccount,
  Arango: arangoModule.checkIfDatabaseExists,
};

const prod = () => {
  return process.env.NODE_ENV === "CI" || process.env.NODE_ENV === "prod";
};

// If you are here because you are implementing another database, then
// just add to the hashtables above! No need to touch down here.
routes.database = async (req, res) => {
  const { email, userid } = req.session;
  const { database } = req.params;
  const { Accounts } = db.getModels();
  const user = userid && (await Accounts.findOne({ where: { id: userid } }));
  const { username, dbPassword } = user || {};
  const renderData = { email, username, dbPassword, database };
  renderData.dbHost = prod() ? dbHost[database] : dev_dbHost[database];
  renderData.dbExists = username && (await checkAccount[database](username));
  res.render("tutorial", renderData);
};

module.exports = routes;
