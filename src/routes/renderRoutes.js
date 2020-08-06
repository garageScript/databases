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
    username: req.session.username,
    dbPassword: userAccount.dbPassword,
  });
};

module.exports = routes;
