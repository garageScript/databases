const { Op } = require("sequelize");
const db = require("./sequelize/db");
const pg = require("./database/postgres/pg");
const es = require("./database/elasticsearch/elastic");

const run = async () => {
  await db.start();
  await pg.startPGDB();
  const { Accounts } = db.getModels();
  const userAccount = await Accounts.findAll({
    attributes: ["id", "username"],
    where: {
      [Op.and]: [
        {
          createdAt: {
            [Op.lt]: new Date(new Date() - 1000),
          },
        },
        { email: null },
      ],
    },
  });
  console.log(userAccount);
  userAccount.forEach(async (e) => {
    //await pg.deletePgAccount(e);
    await es.deletePgAccount(e);
    //await e.destroy();
  });
};

run();
