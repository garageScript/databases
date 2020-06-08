const router ={}
const logger = require('../lib/log')(__filename)
const dbModule = require('../sequelize/db')
const {setDBPassword} = require('../lib/users')
router.patch =  async(req,res)=>{

    //how to connect userId with user obj & userInfo?
    if(req.params.id===null){
        logger.error('no userId')
        return res.status(400).json({error:{message:'no userId'}})
    }
    
    const {Accounts} = dbModule.getModels()
    const userAccount = await Accounts.findOne({
        where:{
            id:req.params.id
        }
    })

    if(!userAccount){
        logger.error(`account does not exist`)
        return res.status(400).json({error:{message:"account does not exist"}})
    }
    
    if(userAccount && !req.body.password){
        logger.error(`user ${userAccount.id} updates password`)
        return res.status(400).json({error:{message:'invalid password update'}})
    }
    try {
        await setDBPassword(userAccount,req.body.password) 
        logger.info(`user ${userAccount.id} updates password`)
        return res.status(200).json('success')
      } catch (err) {
        logger.error('Password update failed. Please try again')
        //logger.error(`Could not update password to user ${userAccount.id}`)
        return res.status(500).json({ error: {message: 'Password update failed. Please try again'}})
      }
}



module.exports=router