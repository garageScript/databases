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
  if (!req.session.username) {
    return res.render("welcome", { username: null });
  }
  const { Accounts } = db.getModels();
  const user = await Accounts.findOne({
    where: {
      id: req.session.userid,
    },
  });
  if (!user) {
    return res.render("welcome", { username: req.session.username });
  }
  if (!user.dbPassword) {
    return res.render("setDBpassword", { username: req.session.username });
  }
  res.render("database", {
    username: req.session.username,
    dbPassword: user.dbPassword,
  });
};

module.exports = routes;
