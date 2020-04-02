const { Client } = require('pg')
require('dotenv').config()

const pgModule = {}
let client

pgModule.startPGDB = async ()=>{
  try{
    client = new Client({
      host: process.env.HOS,
      port: process.env.PORT,
      user: process.env.USERNAME,
      password: process.env.PASSWORD,
      database: process.env.DATABASE
    })
    await client.connect()
  }catch(err){
    console.log('connection failed', err)
    return await {
      error: {
        message: 'Connection to PG failed'
      }
    }
  }
}

pgModule.closePGDB = async ()=>{
  try{
    await client.end()
  }catch(err){
    console.log('connection failed to close', err)
    return {
      error: {
        message: 'Connection to PG failed to close'
      }
    }
  }
}

pgModule.createPgAccount = async (username, password)=>{
  try{
    if(!username || !password) return
    await client.query(`CREATE DATABASE IF NOT EXISTS ${username}`)
    await client.query(`CREATE USER IF NOT EXISTS ${username} WITH ENCRYPTED password '${password}'`)
    await client.query(`GRANT ALL PRIVILEGES ON DATABASE ${username} TO ${username}`)
  }catch(err){
    console.log('failed to createPgAccount', err)
    throw new Error(`failed to createPgAccount for user: ${username}`)
  }
}

pgModule.deletePgAccount = async (username)=>{
  try{
    if(!username) return
    await client.query(`DROP DATABASE IF EXISTS ${username}`)
    await client.query(`DROP USER IF EXISTS ${username}`)
  }catch(err){
    console.log('failed to deletePgAccount', err)
    throw new Error(`failed to deletePgAccount for database and user: ${username}`)
  }
}

module.exports = pgModule
