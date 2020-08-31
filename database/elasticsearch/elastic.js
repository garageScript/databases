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

es.createUser = async (account) => {
  if (!account.username || !account.password || !account.email) {
    return logger.error("Account data is invalid");
  }
  const r1 = await sendESRequest(
    `/_security/role/${account.username}`,
    "POST",
    {
      indices: [
        {
          names: [account.username],
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
      password: account.password,
      roles: [account.username],
    }
  );
  const err = r1.error || r2.error;
  if (err) {
    return logger.error(err);
  }
  logger.info("Successfully created Elastisearch user", account.email);
};

es.deleteUser = async (account) => {
  if (!account.username || !account.password || !account.email) {
    return logger.error("Account data is invalid");
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
    return logger.error("Deleting Elasticsearch user failed");
  }
  logger.info("Successfully deleted Elasticsearch user", account.email);
};

module.exports = es;
