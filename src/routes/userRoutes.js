const logger = require('../../lib/log')(__filename)
const db = require('../../sequelize/db')
const {logIn} = require('../../lib/users')

const obj = {}

obj.loginUser = async (req, res) => {
    const inputInfo = {
      username: req.body.username,
      password: req.body.password,
      email: req.body.email
    }
    try {
      const userInfo = await logIn(inputInfo)
      req.session.username = userInfo.username
      logger.info('Logged in', userInfo.username)
      res.status(200).json(`${userInfo.username} is logged in`)
    } catch (err) {
      logger.info(err)
      res.status(500).json({error: {message: 'Login user failed. Please try again'}})
    }
}

obj.logoutUser = (req, res) => {
    req.session.username = ''
    logger.info('user logged out', req.params.id)
    res.status(200).json(`Logout succeded`)
}

module.exports = obj