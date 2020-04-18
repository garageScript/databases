require('dotenv').config()

const express = require('express')
const app = express()
const {start, update, close, Account} = require('./sequelize/db')

app.get('/', ()=>{
  res.send('Database Project')
})

app.listen(process.env.PORT || 3000)
