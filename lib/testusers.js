const users = require('./users')
const db = require('../sequelize/db')

const start = async () => {
    await db.start()
    
    try {
        const data = await users.setDBPassword({
            username: 't4t5clvkuw3e',
            password: '1q2w3e3er4tt',
            email: 'te3r234@c02d3.com'
        }, 'il0v23databases')
        console.log('----------------------------------------------------')
        console.log('----------------------------------------------------')
        console.log('----------------------------------------------------')
        console.log('----------------------------------------------------')
        console.log('----------------------------------------------------')
        console.log('----------------------------------------------------')
        console.log('----------------------------------------------------')
        console.log(data)

    } catch (err) {
        console.log('----------------------------------------------------')
        console.log('----------------------------------------------------')
        console.log('----------------------------------------------------')
        if (err) console.log(err)
    }
}

start()