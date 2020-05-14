const yup = require('yup')

const users = {}

const schema = yup.object().shape({
  username: yup.string().required().matches(/^[0-9a-zA-Z]+$/, "username cannot contain non-alphanumeric characters"),
  email: yup.string().required().email(),
  password: yup.string().required().min(8)
});

users.signUp = (userInfo) => {
  return schema.validate(userInfo).catch((err) => { return {
      errors: err.errors
    }
  })
} 


const db = require('../sequelize/db')

const start = async () => {
  await db.start()
  const {Accounts} = db.getModels()
  console.log(Accounts)
  const allAccounts = await Accounts.findOne({
    where: {
      username: '12345'
    }
  })
  // Accounts.findAll
  console.log(allAccounts.dataValues)

    /*
  Accounts.create({
    username: '12345',
    email: 'hello@google.com',
    password: 'abc123'
  })
  */
  return
}

start()


users.logIn = (userInfo) => {
  
}

module.exports = users

