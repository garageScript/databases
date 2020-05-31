const {startServer, stopServer, getApp} = require('./server')
const db = require('../sequelize/db')

const startTest = async () => {
    await db.start()
    startServer(3000)
}

startTest()