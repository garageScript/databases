const logger = require('../lib/log')(__filename)
const db = require('../sequelize/db')
const {signUp} = require('../lib/users')

const obj = {}

obj.usersPOSTCallback = async (req, res) => {
    const userInfo = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    }
    if (!userInfo.username || !userInfo.email || !userInfo.password) {
        logger.info("invalid input")
        return res.status(400).json({error: {message: "invalid input"}})
    }
    try {
        await signUp(userInfo)
        logger.info('Succeded creating user account', userInfo.username)
        return res.status(200).json('Succeded creating user account')
    } catch (err) {
        logger.error("Creating user failed", userInfo.username, err)
        res.status(500).json({error: {message: 'Creating user failed. Please try again'}})
    }
}
  
obj.usersDELETECallback = async (req, res) => {
    if (!req.params.id) {
        logger.info("user id was not provided")
        return res.status(400).json({error: {message: "user id was not provided"}})
    }
    const {Accounts} = db.getModels()
    try {
        const account = await Accounts.findOne({
        where: {
            id: req.params.id
        }
        })
        if (!account) {
        logger.info("Cannot find user", req.params.id)
        res.status(500).json({error: {message: "Cannot find user"}})
        return
        }
        if (account.username !== req.session.username) {
            logger.error("Username does not match to cookie", account.username, req.session.username)
            res.status(500).json({error: {message: "Username does not match to cookie"}})
            return
        }
        account.destroy()
        logger.info('Succeded deleting user account', req.params.id)
        return res.status(200).json('Succeded deleting user account')
    } catch (err) {
        logger.error("Deleting user failed", req.params.id, err)
        res.status(500).json({error: {message: 'Deleting user failed. Please try again'}})
    }
}

obj.loginPOSTCallback = (req, res) => {
    const inputInfo = {
      username: req.body.username,
      password: req.body.password,
      email: req.body.email
    }
    try {
      const userInfo = logIn(inputInfo)
      req.session.username = userInfo.username
      logger.info('Logged in', userInfo.username)
      res.status(200).json(`${userInfo.username} is logged in`)
    } catch (err) {
      logger.info(err)
    }
}

module.exports = obj