require("dotenv").config();
const { Database } = require("arangojs");
const { sendFetch } = require("../../lib/sendFetch");
const logger = require("./../../lib/log")(__filename);

const arangoModule = {};
let db;

arangoModule.checkIfDatabaseExists = async (name) => {
  // returns array of objects containing a '_name' key.
  // Ex [{ _name: 'lol' }, { _name: 'cakes' }]
  const names = await db.databases();
  return names.map((db) => db._name).includes(name);
};

arangoModule.startArangoDB = async () => {
  db = new Database({
    url: process.env.ARANGO_URL,
    databaseName: "_system",
    auth: {
      username: process.env.ARANGO_USER,
      password: process.env.ARANGO_PW,
    },
  });
};

arangoModule.closeArangoDB = () => db.close();

arangoModule.createAccount = async (account) => {
  if (!account) return;
  const { username, dbPassword } = account;
  if (!username || !dbPassword) return;
  if (await arangoModule.checkIfDatabaseExists(username)) return;

  try {
    await db.createDatabase(username, {
      users: [{ username, password: dbPassword }],
    });
  } catch (err) {
    logger.error(err);
    throw new Error("Error in creating arango database :(", err);
  }
};

arangoModule.deleteAccount = async (username) => {
  if (!username) return;
  if (!(await arangoModule.checkIfDatabaseExists(username))) return;

  try {
    // grabs JWT token for use in second fetch
    const {
      jwt,
    } = await sendFetch(
      `${process.env.ARANGO_URL}_db/_system/_open/auth`,
      "post",
      { username: process.env.ARANGO_USER, password: process.env.ARANGO_PW }
    );

    // uses jwt token to authenticate request to delete user from arango database
    await sendFetch(
      `${process.env.ARANGO_URL}_db/_system/_api/user/${username}`,
      "delete",
      null,
      `bearer ${jwt}`
    );

    // deletes database(username and database names are the same for each user)
    await db.dropDatabase(username);
  } catch (err) {
    logger.error(err);
    throw new Error(
      "Sum ting wong... deletion of arango user has failed.",
      err
    );
  }
};

module.exports = arangoModule;
