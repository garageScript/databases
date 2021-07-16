const { Op } = require("sequelize");
const db = require("../sequelize/db");
const pg = require("../database/postgres/pg");
const arango = require("../database/arango/arango");
const es = require("../database/elasticsearch/elastic");
const ignite = require("../database/ignite/ignite");
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
    return Promise.all(
      userAccount.map(async (user) => {
        const { username } = user;
	      try {
        const pgDbExists = await pg.userHasPgAccount(username);
        if (pgDbExists) await pg.deletePgAccount(user);
	      } catch( pgError) {
			    logger.error("PG Delete Account Error During cleanAnonymous Check", pgError);
	      }

	      try {
        const esDbExists = await es.checkAccount(username);
        if (esDbExists) await es.deleteAccount(user);

	      } catch( esError) {
			    logger.error("ES Delete Account Error During cleanAnonymous Check", esError);
	      }

	      try {
        const arangoDbExists = await arango.checkIfDatabaseExists(username);
        if (arangoDbExists) await arango.deleteAccount(username);
	      } catch( arangoError) {
			    logger.error("Arango Delete Account Error During cleanAnonymous Check", arangoError);
	      }

        const igniteDbExists = await ignite.checkAccount(username);
        if (igniteDbExists) await ignite.deleteAccount(username);

        return await user.destroy();
      })
    ).then(() => {
      logger.info("Cleaning expired accounts has completed");
      const timer = setTimeout(util.cleanAnonymous, 24 * 60 * 60 * 1000);
      return {
        stop: () => {
          clearTimeout(timer);
        },
      };
    });
  } catch (err) {
    logger.error("Cleaning expired accounts has failed", err);
  }
};

module.exports = util;
