const logger = require("./../../lib/log")(__filename);
const escape = require("pg-escape");
const { Client } = require("pg");
require("dotenv").config();

const pgModule = {};
let client;

pgModule.startPGDB = () => {
  client = new Client({
    host: process.env.HOST,
    user: process.env.PG_USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
  });
  return client.connect();
};

pgModule.closePGDB = () => {
  return client.end();
};

pgModule.createPgAccount = async (user) => {
  const { username, dbPassword } = user;
  if (!username || !dbPassword) return;
  try {
    // Could not escape user input by using $1 $2
    //   https://github.com/brianc/node-postgres/issues/539

    const sqlQuery1 = escape(`CREATE DATABASE %s;`, username);
    const sqlQuery2 = escape(
      `create user %s with encrypted password %Q`,
      username,
      dbPassword
    );

    const sqlQuery3 = escape(
      `GRANT ALL PRIVILEGES ON DATABASE %s TO %s`,
      username,
      username
    );

    await client.query(sqlQuery1);
    await client.query(sqlQuery2);
    await client.query(sqlQuery3);
  } catch (err) {
    logger.error(err);
    throw new Error(`failed to createPgAccount for user: ${username}`);
  }
};

pgModule.deletePgAccount = async (username) => {
  if (!username) return;
  try {
    await client.query(`DROP DATABASE IF EXISTS $1`, [username]);
    await client.query(`DROP USER IF EXISTS $1`, [username]);
  } catch (err) {
    logger.error(err);
    throw new Error(
      `failed to deletePgAccount for database and user: ${username}`
    );
  }
};

pgModule.userHasPgAccount = async (username) => {
  logger.info(`checking to see if ${username} has a pg account`);
  const result = await client.query(`SELECT 1 FROM pg_roles WHERE rolname=$1`, [
    username,
  ]);

  logger.info(`result: ${result.rowCount}`);
  return Boolean(result.rowCount);
};

module.exports = pgModule;
