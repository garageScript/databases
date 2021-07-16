const IgniteClient = require("apache-ignite-client");
const logger = require("./../../lib/log")(__filename);
const { SqlFieldsQuery } = require("apache-ignite-client/lib/Query");
const IgniteClientConfiguration = IgniteClient.IgniteClientConfiguration;
const CacheConfiguration = IgniteClient.CacheConfiguration;
require("dotenv").config();
const igniteModule = {};
let igniteClient;
igniteModule.startIgnite = async () => {
  try {
    igniteClient = new IgniteClient();
    const configuration = new IgniteClientConfiguration(process.env.IGNITE_HOST)
      .setUserName(process.env.IGNITE_USER)
      .setPassword(process.env.IGNITE_PASSWORD);
    await igniteClient.connect(configuration);
    logger.info("Connected to Ignite database");
  } catch (err) {
    logger.error(err);
    throw new Error(err);
  }
};
igniteModule.checkAccount = async (username) => {
  if (!username) return;
  try {
    const caches = await igniteClient.cacheNames();
    return caches.includes(username);
  } catch (err) {
    logger.error(`Error checking ignite database for ${username}`);
    throw new Error(err);
  }
};
igniteModule.closeIgnite = async () => {
  try {
    await igniteClient.disconnect();
    logger.info("Closed connection to Ignite database");
  } catch (err) {
    logger.error(`Error closing connection to Ignite database`);
    throw new Error(err);
  }
};

igniteModule.createAccount = async (user) => {
  const { username, dbPassword } = user;
  if (!username || !dbPassword) return;
  try {
    const cache = await igniteClient.getOrCreateCache(
      username,
      new CacheConfiguration().setSqlSchema("PUBLIC")
    );
    await cache.query(
      new SqlFieldsQuery(
        `CREATE USER "${username}" WITH PASSWORD '${dbPassword}'`
      )
    );
    logger.info(`Successfully created ${username} cache`);
  } catch (err) {
    logger.error(`Error creating ignite ${username}`);
    throw new Error(err);
  }
};
igniteModule.deleteAccount = async (username) => {
  if (!username) return;
  try {
    const cache = await igniteClient.getOrCreateCache(
      username,
      new CacheConfiguration().setSqlSchema("PUBLIC")
    );
    await cache.query(new SqlFieldsQuery(`DROP USER "${username}"`));
    await igniteClient.destroyCache(username);
    logger.info(`Successfully deleted ${username} cache`);
  } catch (err) {
    logger.error(`Error deleting ignite ${username}`);
    throw new Error(err);
  }
};
module.exports = igniteModule;
