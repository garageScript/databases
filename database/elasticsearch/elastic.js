const logger = require("./../../lib/log")(__filename);
require("dotenv").config();
const { sendFetch } = require("../../lib/sendFetch");
const es = {};

const ES_HOST = process.env.ES_HOST || "http://127.0.0.1:9200";
const authorization =
  "Basic " +
  Buffer.from(`elastic:${process.env.ES_PASSWORD}`).toString("base64");

es.createAccount = async (account) => {
  if (!account.username || !account.dbPassword) {
    logger.error("Account data is invalid");
    throw new Error("Account data is invalid");
  }
  const r1 = await sendFetch(
    `${ES_HOST}/_security/role/${account.username}`,
    "POST",
    {
      indices: [
        {
          names: [`${account.username}-*`],
          privileges: ["all"],
        },
      ],
    },
    authorization
  );
  const r2 = await sendFetch(
    `${ES_HOST}/_security/user/${account.username}`,
    "POST",
    {
      email: account.email,
      password: account.dbPassword,
      roles: [account.username],
    },
    authorization
  );
  const r3 = await sendFetch(
    `${ES_HOST}/${account.username}-example/_doc`,
    "POST",
    {
      message:
        "Congratulations! You have created your first index at Elasticsearch!",
    },
    authorization
  );
  const err = r1.error || r2.error || r3.error;
  if (err) {
    logger.error(err);
    throw new Error(
      `Failed to create Elasticsearch account for user: ${account.email}`,
      err
    );
  }
  if (!r1.role.created || !r2.created) {
    logger.error("User already exists", account.email);
    throw new Error(
      `Elasticsearch account already exists for user: ${account.email}`
    );
  }
  logger.info("Successfully created Elastisearch user", account.email);
};

es.deleteAccount = async (account) => {
  if (!account.username || !account.password) {
    logger.error("Account data is invalid");
    throw new Error("Account data is invalid");
  }
  const r1 = await sendFetch(
    `${ES_HOST}/_security/user/${account.username}`,
    "DELETE",
    null,
    authorization
  );
  const r2 = await sendFetch(
    `${ES_HOST}/_security/role/${account.username}`,
    "DELETE",
    null,
    authorization
  );
  const err = r1.error || r2.error;
  if (err || !r1.found || !r2.found) {
    logger.error("Deleting Elasticsearch user failed");
    throw new Error(
      `Failed to delete Elasticsearch account for user: ${account.id}`
    );
  }
  logger.info("Successfully deleted Elasticsearch user", account.id);
};

es.checkAccount = async (account) => {
  if (!account.username || !account.password || !account.email) {
    logger.error("Account data is invalid");
    throw new Error("Account data is invalid");
  }
  const index = account.username + "-example";
  const r1 = await sendFetch(`${ES_HOST}/${index}`, "GET", null, authorization);
  if (r1[index]) return true;
  return false;
};

module.exports = es;
