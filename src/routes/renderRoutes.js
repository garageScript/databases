const db = require("../../sequelize/db");
const routes = {};

routes.postgres = async (req, res) => {
  if (!req.session.username) return res.redirect("/");
  const { Accounts } = db.getModels();
  const userAccount = await Accounts.findOne({
    where: {
      id: req.session.userid,
    },
  });
  res.render("postgres", {
    username: req.session.username,
    dbPassword: userAccount.dbPassword,
  });
};
routes.landingpage = async (req, res) => {
  if(!req.session.username){
    return res.render('welcome')
  } 
  const { Accounts } = db.getModels()
  const user = await Accounts.findOne({
    where: {
      id: req.session.id
    },
  })
  if(!user){
     return res.render('welcome')
  }
  if(!user.dbPassword){
     return res.render('setDBpassword', {username: req.session.username})
  }
  res.render('databases',{username: req.session.username})
}

module.exports = routes;
