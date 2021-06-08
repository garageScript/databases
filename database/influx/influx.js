const Influx = require("influx");
const logger = require("./../../lib/log")(__filename);
require("dotenv").config();

const influxModule = {};
let client;
const HOST = process.env.INF_HOST||"localhost";
const PORT = process.env.INF_PORT||8086;
influxModule.startInflux = () => {
  client = new Influx.InfluxDB({
    host: HOST,
    port: PORT,
  });
  logger.info("Sucessfully started InfluxDB");
};

influxModule.createAccount = async (account) => {
  const { username, dbPassword } = account;
  if (!username || !dbPassword) return;
  try {
    await client.createUser(username, dbPassword);
    await client.createDatabase(username);
    await client.grantPrivilege(username, "WRITE", username);
    logger.info(
      `Sucessfully created new user and database with ${username} name`
    );
  } catch (err) {
    logger.error(err);
    throw new Error(`failed to create new influx user with ${username} name`);
  }
};
influxModule.deleteAccount = async (username) => {
  if (!username) return;
  try {
    await client.dropUser(username);
    await client.dropDatabase(username);
    logger.info(`Sucessfully deleted account with ${username} name`);
  } catch (err) {
    logger.error(err);
    throw new Error(`failed to delete influx ${username} account`);
  }
};
influxModule.checkAccount = async (username) => {
  if (!username) return;
  try {
    const users = await client.getUsers();
    const user = users.filter((u) => u === username)[0];
    logger.info(
      user
        ? `Found ${user} account with ${username}`
        : `No account with ${username} were found`
    );
    return Boolean(user);
  } catch (err) {
    logger.error(err);
    throw new Error(`failed to check for influx ${username} account`);
  }
};

module.exports = influxModule;
