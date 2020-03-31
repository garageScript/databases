const { Client } = require('pg')
require('dotenv').config()

const pgModule = {}
let client

pgModule.startPGDB = async ()=>{
  try{
    client = new Client({
      host: process.env.HOST,
      port: process.env.PORT,
      user: process.env.USERNAME,
      password: process.env.PASSWORD,
      database: process.env.DATABASE
    })
    await client.connect()
  }catch(err){
    console.log('connection failed', err)
  }
}

pgModule.closePGDB = async ()=>{
  try{
    await client.end()
  }catch(err){
    console.log('connection failed to closed')
  }
}

pgModule.createPgAccount = async (username, password)=>{
  try{
    await client.query(`CREATE DATABASE IF NOT EXISTS ${username}`)
    await client.query(`CREATE USER IF NOT EXISTS ${username} WITH ENCRYPTED password '${password}'`)
    await client.query(`GRANT ALL PRIVILEGES ON DATABASE ${username} TO ${username}`)
  }catch(err){
    console.log('failed to createPgAccount')
  }
}

pgModule.deletePgAccount = async (username)=>{
  try{
    await client.query(`DROP DATABASE IF EXISTS ${username}`)
    await client.query(`DROP USER IF EXISTS ${username}`)
  }catch(err){
    console.log('failed to deletePgAccount')
  }
}

module.exports = pgModule
