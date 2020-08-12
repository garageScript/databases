const neo4j = require('neo4j-driver')
let driver
// require('dotenv').config()
const neo4jModule = {}

neo4jModule.startNeo4j = () => {
  driver = neo4j.driver(
    'neo4j://104.168.169.204',
    neo4j.auth.basic('neo4j', 'neo4j')
  )
}

neo4jModule.closeNeo4j = async () => {
  return await driver.close()
}

module.exports = neo4jModule
