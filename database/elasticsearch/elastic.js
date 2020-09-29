const fetch = require("node-fetch");
const logger = require("./../../lib/log")(__filename);
require("dotenv").config();

const es = {};

const ES_HOST = process.env.ES_HOST || "http://127.0.0.1:9200";
const authorization =
  "Basic " +
  Buffer.from(`elastic:${process.env.ES_PASSWORD}`).toString("base64");

const sendESRequest = (path, method, body) => {
  const options = {
    method,
    headers: {
      Authorization: authorization,
      "content-type": "application/json",
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  return fetch(`${ES_HOST}${path}`, options).then((r) => r.json());
};

es.createAccount = async (account) => {
  if (!account.username || !account.dbPassword || !account.email) {
    logger.error("Account data is invalid");
    throw new Error("Account data is invalid");
  }
  const r1 = await sendESRequest(
    `/_security/role/${account.username}`,
    "POST",
    {
      indices: [
        {
          names: [`${account.username}-*`],
          privileges: ["all"],
        },
      ],
    }
  );
  const r2 = await sendESRequest(
    `/_security/user/${account.username}`,
    "POST",
    {
      email: account.email,
      password: account.dbPassword,
      roles: [account.username],
    }
  );
  const r3 = await sendESRequest(`/${account.username}-example/_doc`, "POST", {
    message:
      "Congratulations! You have created your first index at Elasticsearch!",
  });
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
  if (!account.username) {
    logger.error("Account data is invalid");
    throw new Error("Account data is invalid");
  }
  const r1 = await sendESRequest(
    `/_security/user/${account.username}`,
    "DELETE"
  );
  const r2 = await sendESRequest(
    `/_security/role/${account.username}`,
    "DELETE"
  );
  const err = r1.error || r2.error;
  if (err || !r1.found || !r2.found) {
    logger.error("Deleting Elasticsearch user failed");
    throw new Error(
      `Failed to delete Elasticsearch account for user: ${account.email}`
    );
  }
  logger.info("Successfully deleted Elasticsearch user", account.email);
};

es.checkAccount = async (account) => {
  if (!account.username || !account.password || !account.email) {
    logger.error("Account data is invalid");
    throw new Error("Account data is invalid");
  }
  const index = account.username + "-example";
  const r1 = await sendESRequest(`/${index}`, "GET");
  if (r1[index]) return true;
  return false;
};

module.exports = es;
