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

routes.mongodb = async (req, res) => {
  return res.render("mongodb");
};

routes.neo4j = async (req, res) => {
  return res.render("neo4j");
};

module.exports = routes;
