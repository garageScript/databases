const db = require("../../sequelize/db");
const routes = {};

routes.postgres = async (req, res) => {
  if (!req.session.username) return res.redirect("/");
  const { Accounts } = db.getModels();
  const userAccount = await Accounts.findOne({
    where: {
      username: req.session.username,
    },
  });
  res.render("postgres", {
    username: req.session.username,
    dbPassword: userAccount.dbPassword,
  });
};

module.exports = routes;