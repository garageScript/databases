const db = require("../../sequelize/db");
const routes = {};

routes.database = async (req, res) => {
  if (!req.session.username) return res.redirect("/");
  const { Accounts } = db.getModels();
  const userAccount = await Accounts.findOne({
    where: {
      id: req.session.userid,
    },
  });
  res.render("database", {
    username: req.session.username,
    dbPassword: userAccount.dbPassword,
  });
};

module.exports = routes;
