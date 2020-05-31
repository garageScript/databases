const logger = require('../lib/log')(__filename)
const db = require('../sequelize/db')

let Accounts

const run = async () => {
    await db.start()
    Accounts = db.getModels().Accounts
}

const run2 = async () => {
    const account = await Accounts.findAll()
    console.log(account)
}

run().then(run2)