const db = require("../../sequelize/db");
const pg = require("../../database/postgres/pg");

const routes = {};

routes.postgres = async (req, res) => {
  if (!req.session.email) return res.redirect("/");
  const { Accounts } = db.getModels();
  const userAccount = await Accounts.findOne({
    where: {
      id: req.session.userid,
    },
  });
  const dbExists = await pg.userHasPgAccount(userAccount.username);
  res.render("postgres", {
    email: req.session.email,
    username: userAccount.username,
    dbPassword: userAccount.dbPassword,
    dbExists: dbExists,
  });
};

module.exports = routes;
