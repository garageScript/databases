jest.mock("sequelize");
jest.mock("../sequelize/db");
jest.mock("../database/postgres/pg");
jest.mock("../database/elasticsearch/elastic");
jest.mock("./log");

const sequelize = require("sequelize");
const db = require("../sequelize/db");
const pg = require("../database/postgres/pg");
const es = require("../database/elasticsearch/elastic");

sequelize.Op = { and: "and", lt: "lt" };
const Accounts = {
  findAll: jest.fn(),
};
db.getModels = () => {
  return { Accounts: Accounts };
};
pg.deletePgAccount = jest.fn();
es.deleteAccount = jest.fn();
const logGen = require("./log");
const logger = {
  info: jest.fn(),
  error: jest.fn(),
};
logGen.mockReturnValue(logger);

const util = require("./util");

describe("Testing cleanAnonymous function", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should call findAll with correct queries", async () => {
    // Hi future engineers, I wrote some strict test here because I thought
    // that it's important to protect this query. Someone can accidently
    // clear up the whole user account database by making a little change.
    // If you are changing this, please do so with caution and plentiful of tests.
    Accounts.findAll.mockReturnValue([]);
    await util.cleanAnonymous();
    const args = Accounts.findAll.mock.calls[0][0];
    expect(args.attributes[0]).toEqual("id");
    expect(args.attributes[1]).toEqual("username");
    expect(Number(args.where.and[0].createdAt.lt)).toBeLessThan(
      Number(new Date(new Date() - 5 * 24 * 60 * 60 * 1000 + 1))
    );
    expect(args.where.and[1].email).toBeNull();
  });
  it("should not call database functions if expired accounts are found but database does not exist", async () => {
    Accounts.findAll.mockReturnValue([{ destroy: () => {} }]);
    pg.userHasPgAccount = () => false;
    es.checkAccount = () => false;
    await util.cleanAnonymous();
    expect(pg.deletePgAccount).not.toHaveBeenCalled();
    expect(es.deleteAccount).not.toHaveBeenCalled();
  });
  it("should call database functions if expired accounts are found", async () => {
    Accounts.findAll.mockReturnValue([{ destroy: () => {} }]);
    pg.userHasPgAccount = () => true;
    es.checkAccount = () => true;
    await util.cleanAnonymous();
    expect(pg.deletePgAccount).toHaveBeenCalled();
    expect(es.deleteAccount).toHaveBeenCalled();
  });
  it("should call logger.error if cleaning fails", async () => {
    Accounts.findAll.mockImplementation(() => {
      throw new Error("error");
    });
    await util.cleanAnonymous();
    expect(logger.error).toHaveBeenCalled();
  });
});
