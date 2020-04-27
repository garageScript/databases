const logger = require('./../../lib/log')(__filename)
const { Client } = require('pg')
require('dotenv').config()

const pgModule = {}
let client

pgModule.startPGDB = ()=>{
    client = new Client({
      host: process.env.HOST,
      port: process.env.PORT,
      user: process.env.USERNAME,
      password: process.env.PASSWORD,
      database: process.env.DATABASE
    })
    return client.connect()
}

pgModule.closePGDB = ()=>{
    return client.end()
}

pgModule.createPgAccount = async (username, password)=>{
    if(!username || !password) return
  try{
    await client.query(`CREATE DATABASE IF NOT EXISTS ${username}`)
    await client.query(`CREATE USER IF NOT EXISTS ${username} WITH ENCRYPTED password '${password}'`)
    await client.query(`GRANT ALL PRIVILEGES ON DATABASE ${username} TO ${username}`)
  }catch(err){
    logger.error(err)
    throw new Error(`failed to createPgAccount for user: ${username}`)
  }
}

pgModule.deletePgAccount = async (username)=>{
    if(!username) return
  try{
    await client.query(`DROP DATABASE IF EXISTS ${username}`)
    await client.query(`DROP USER IF EXISTS ${username}`)
  }catch(err){
    logger.error(err)
    throw new Error(`failed to deletePgAccount for database and user: ${username}`)
  }
}

module.exports = pgModule
