const neo4j = require("neo4j-driver");
require("dotenv").config();

let driver;
const neo4jModule = {};

neo4jModule.startNeo4j = () => {
  driver = neo4j.driver(
    `${process.env.NEO4J_URL}`,
    neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
  );

  return driver;
};

neo4jModule.closeNeo4j = async () => {
  await driver.close();
};

module.exports = neo4jModule;
