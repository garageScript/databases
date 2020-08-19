const db = require("../../sequelize/db");
const routes = {};

routes.postgres = async (req, res) => {
  if (!req.session.email) return res.redirect("/");
  const { Accounts } = db.getModels();
  const userAccount = await Accounts.findOne({
    where: {
      id: req.session.userid,
    },
  });
  res.render("postgres", {
    email: req.session.email,
    username: userAccount.username,
    dbPassword: userAccount.dbPassword,
  });
};

module.exports = routes;
