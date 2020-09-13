const logger = require("./../../lib/log")(__filename);
const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");
require("dotenv").config();

const mongoModule = {};
let mongoClient;
let db;

mongoModule.startMongo = () => {
  const dbName = "learnDatabases";
  const url = `mongodb+srv://mongoDB:${process.env.MONGO_PASSWORD}@cluster0.jgkpb.mongodb.net/${dbName}?retryWrites=true&w=majority`;

  MongoClient.connect(url, (err, client) => {
    assert.equal(null, err);
    loggger.info("connected successfully to mongo server");

    db = client.db(dbName);
    mongoClient = client;
    return mongoClient;
  });
};

mongoModule.closeMongo = () => {
  return mongoClient.close();
};

mongoModule.createMongo = (username, obj = {}) => {
  if (!username) return;

  const collection = db.collection(username);

  collection.insert(obj, function (err, result) {
    assert.equal(err, null);
    assert.equal(3, result.result.n);
    assert.equal(3, result.ops.length);
    loggger.info(`Inserted ${obj} from ${username} collection`);
  });
};

mongoModule.deleteMongo = (username, obj = {}) => {
  if (!username) return;

  const collection = db.collection(username);

  collection.deleteOne(obj, function (err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    logger.info(`Removed ${obj} from ${username} collection`);
  });
};

module.exports = mongoModule;
