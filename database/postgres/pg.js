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

pgModule.createPgAccount = async (username, password) => {
  if (!username || !password) return;
  const usernameAlphabetical = username.replace("@", "").replace(".", "");
  try {
    // Could not escape user input by using $1 $2
    //   https://github.com/brianc/node-postgres/issues/539

    const sqlQuery1 = escape(`CREATE DATABASE %s;`, usernameAlphabetical);
    const sqlQuery2 = escape(
      `create user %s with encrypted password %Q`,
      usernameAlphabetical,
      password
    );

    const sqlQuery3 = escape(
      `GRANT ALL PRIVILEGES ON DATABASE %s TO %s`,
      usernameAlphabetical,
      usernameAlphabetical
    );

    await client.query(sqlQuery1);
    await client.query(sqlQuery2);
    await client.query(sqlQuery3);
  } catch (err) {
    logger.error(err);
    throw new Error(`failed to createPgAccount for user: $1`, [
      usernameAlphabetical,
    ]);
  }
};

pgModule.deletePgAccount = async (username) => {
  if (!username) return;
  const usernameAlphabetical = username.replace("@", "").replace(".", "");
  try {
    await client.query(`DROP DATABASE IF EXISTS $1`, [usernameAlphabetical]);
    await client.query(`DROP USER IF EXISTS $1`, [usernameAlphabetical]);
  } catch (err) {
    logger.error(err);
    throw new Error(`failed to deletePgAccount for database and user: $1`, [
      usernameAlphabetical,
    ]);
  }
};

pgModule.userHasPgAccount = async (username) => {
  if (!username) return false;
  const usernameAlphabetical = username.replace("@", "").replace(".", "");

  try {
    const user = await client.query(
      `SELECT 1 FROM `,
      usernameAlphabetical,
      ` WHERE `,
      usernameAlphabetical
    );
    return true;
  } catch (err) {
    logger.error(err);
    return false; // does not exist
  }
};

module.exports = pgModule;
