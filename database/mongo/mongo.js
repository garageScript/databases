const logger = require("./../../lib/log")(__filename);
const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");
require("dotenv").config();

const mongoModule = {};
let globalClient;

mongoModule.startMongo = () => {
  return new Promise((resolve, reject) => {
    const dbName = "admin";
    const url = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@127.0.0.1:27017/${dbName}?retryWrites=true&w=majority`;

    MongoClient.connect(url, (err, client) => {
      if (err) {
        return reject(err);
      }
      globalClient = client;
      logger.info("connected successfully to mongo server");
      return resolve({ status: "success" });
    });
  });
};

mongoModule.closeMongo = () => {
  logger.info("disconnecting from mongo server");
  return globalClient.close();
};

module.exports = mongoModule;
