const logger = require("./../../lib/log")(__filename);
require("dotenv").config();
const { sendFetch } = require("../../lib/sendFetch");
const es = {};

const ES_HOST = process.env.ES_HOST || "http://127.0.0.1:9200";
const authorization =
  "Basic " +
  Buffer.from(`elastic:${process.env.ES_PASSWORD}`).toString("base64");

es.createAccount = async (account) => {
  const { username, email, dbPassword } = account;
  if (!username || !dbPassword) {
    logger.error("Account data is invalid");
    throw new Error("Account data is invalid");
  }
  const r1 = await sendFetch(
    `${ES_HOST}/_security/role/${username}`,
    "POST",
    {
      indices: [
        {
          names: [`${username}-*`],
          privileges: ["all"],
        },
      ],
    },
    authorization
  );
  const r2 = await sendFetch(
    `${ES_HOST}/_security/user/${username}`,
    "POST",
    {
      email: email,
      password: dbPassword,
      roles: [username],
    },
    authorization
  );
  const r3 = await sendFetch(
    `${ES_HOST}/${username}-example/_doc`,
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
      `Failed to create Elasticsearch account for user: ${email}`,
      err
    );
  }
  if (!r1.role.created || !r2.created) {
    logger.error("User already exists", email);
    throw new Error(`Elasticsearch account already exists for user: ${email}`);
  }
  logger.info("Successfully created Elastisearch user", account.email);
};

es.deleteAccount = async (account) => {
  const { username, id } = account;
  if (!username) {
    logger.error("Account data is invalid");
    throw new Error("Account data is invalid");
  }
  const r1 = await sendFetch(
    `${ES_HOST}/_security/user/${username}`,
    "DELETE",
    null,
    authorization
  );
  const r2 = await sendFetch(
    `${ES_HOST}/_security/role/${username}`,
    "DELETE",
    null,
    authorization
  );
  const r3 = await sendFetch(`/${username}-*`, "DELETE", null, authorization);
  const err = r1.error || r2.error;
  if (err || !r1.found || !r2.found) {
    logger.error("Deleting Elasticsearch user failed");
    throw new Error(`Failed to delete Elasticsearch account for user: ${id}`);
  }
  logger.info("Successfully deleted Elasticsearch user", id);
};

es.checkAccount = async (username) => {
  if (!username) return;
  try {
    const r1 = await sendFetch(
      `${ES_HOST}/_security/user/${username}`,
      "GET",
      null,
      authorization
    );
    logger.info(
      `Checking Elasticsearch account for ${username} result:`,
      !!r1[username]
    );
    if (r1[username]) return true;
    return false;
  } catch (err) {
    logger.error("Error checking for elasticsearch Account", err);
    throw new Error(
      "hell0 sum ting went wong with checkin for the elasticsearch account"
    );
  }
};

module.exports = es;
