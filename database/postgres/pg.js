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
    await client.query(`CREATE DATABASE IF NOT EXISTS $1`, [username])
    await client.query(`CREATE USER IF NOT EXISTS $1 WITH ENCRYPTED password $2`, [username, password])
    await client.query(`GRANT ALL PRIVILEGES ON DATABASE $1 TO $1`, [username])
  }catch(err){
    logger.error(err)
    throw new Error(`failed to createPgAccount for user: $1`, [username])
  }
}

pgModule.deletePgAccount = async (username)=>{
    if(!username) return
  try{
    await client.query(`DROP DATABASE IF EXISTS $1`, [username])
    await client.query(`DROP USER IF EXISTS $1`, [username])
  }catch(err){
    logger.error(err)
    throw new Error(`failed to deletePgAccount for database and user: $1`, [username])
  }
}

module.exports = pgModule
