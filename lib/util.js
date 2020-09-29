const { Op } = require("sequelize");
const db = require("./sequelize/db");
const pg = require("./database/postgres/pg");
const es = require("./database/elasticsearch/elastic");

const util = {};

util.cleanAnonymous = async () => {
  const { Accounts } = db.getModels();
  const userAccount = await Accounts.findAll({
    attributes: ["id", "username"],
    where: {
      [Op.and]: [
        {
          createdAt: {
            [Op.lt]: new Date(new Date() - 5 * 24 * 60 * 60 * 1000),
          },
        },
        { email: null },
      ],
    },
  });
  userAccount.forEach(async (e) => {
    await pg.deletePgAccount(e);
    await es.deleteAccount(e);
    await e.destroy();
  });
  setTimeout(util.cleanAnonymous, 24 * 60 * 60 * 1000);
};

module.exports = util;
