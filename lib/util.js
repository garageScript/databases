const { Op } = require("sequelize");
const db = require("../sequelize/db");
const pg = require("../database/postgres/pg");
const es = require("../database/elasticsearch/elastic");
const logger = require("./log")(__filename);

const util = {};

util.cleanAnonymous = async () => {
  logger.info("Checking expired anonymous accounts...");
  try {
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
    logger.info(`${userAccount.length} expired accounts are found`);
    userAccount.forEach(async (e) => {
      await pg.deletePgAccount(e);
      await es.deleteAccount(e);
      await e.destroy();
    });
    logger.info("Cleaning expired accounts has completed");
  } catch (err) {
    logger.error("Cleaning expired accounts has failed", err);
  }
  setTimeout(util.cleanAnonymous, 24 * 60 * 60 * 1000);
};

module.exports = util;
