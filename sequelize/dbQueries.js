const {Account} = require('./db')

const createUser = async (username, password, email)=>{
  try{
    await Account.create({
      username: username, 
      password: password,
      email: email
    })
  }catch(err){
    console.log('create user failed', err)
  }
}
createUser('alberto', 'lopez', 'albertolopez7@gmail.com')

const updateUserDBPassword = async (username, dbPassword)=>{
  try{
    await Account.update({dbPassword: dbPassword}, {
      where: {
        username: username
      }
    })
  }catch(err){
    console.log('update dbpassword failed', err)
  }
}

const confirmUserAccount = async (emailConfirmation)=>{
  try{
    const user = await Account.findOne({
      where:{
        emailConfirmation: emailConfirmation 
      }
    })
    if(!user) throw new Error("User not found")
    await user.update({
      emailConfirmation: ''
    })
  }catch(err){
    console.log('user confirmation failed', err)
  }
}

const createSession = (username, password)=>{
}

