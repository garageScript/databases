jest.mock("../../lib/log");
const logGen = require("../../lib/log");
const logger = { error: jest.fn(), info: jest.fn() };
logGen.mockReturnValue(logger);

jest.mock("pg");
const { Client } = require("pg");

logGen.mockReturnValue(logger);

const {
  startPGDB,
  closePGDB,
  createPgAccount,
  deletePgAccount,
  userHasPgAccount,
} = require("./pg");

describe("Test PG DB", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  let mockClient = {
    query: jest.fn().mockReturnValue(Promise.resolve()),
    connect: jest.fn().mockReturnValue(Promise.resolve()),
    end: jest.fn().mockReturnValue(Promise.resolve()),
  };
  Client.mockImplementation(function () {
    return mockClient;
  });
  describe("Test startPGDB && closePGDB", () => {
    it("it should call connect when starting PGDB", async () => {
      await startPGDB();
      expect(mockClient.connect).toHaveBeenCalledTimes(1);
    });
    it("it should call end when closing PGDB", async () => {
      await closePGDB();
      expect(mockClient.end).toHaveBeenCalledTimes(1);
    });
  });
  describe("Test create and delete pgAccount", () => {
    beforeEach(async () => {
      await startPGDB();
    });
    afterEach(async () => {
      await closePGDB();
    });
    describe("Test createPgAccount", () => {
      it("it should execute all queries if required arguments are passed into createPgAccount", async () => {
        const user = { username: "username", dbPassword: "password" };
        await createPgAccount(user);
        expect(mockClient.query).toHaveBeenCalledTimes(3);
        expect(mockClient.query.mock.calls[0]).toEqual([
          `CREATE DATABASE username;`,
        ]);

        const createQueryRegex = new RegExp(
          /create user username with encrypted password \$.\$password\$.\$/
        );
        expect(
          createQueryRegex.test(mockClient.query.mock.calls[1][0])
        ).toEqual(true);

        expect(mockClient.query.mock.calls[2]).toEqual([
          `GRANT ALL PRIVILEGES ON DATABASE username TO username`,
        ]);
      });
      it("it should not execute any queries in createPgAccount if required arguments are not passed in", async () => {
        const user = {};
        await createPgAccount(user);
        expect(mockClient.query).toHaveBeenCalledTimes(0);
      });
      it("it should check if logger.error is called at throw of createPgAccount", async () => {
        try {
          await mockClient.query.mockReturnValue(Promise.reject());
          const user = { username: "username", dbPassword: "password" };
          const resCreatePgAccount = await createPgAccount(user);
          expect(resCreatePgAccount).rejects.toThrow();
        } catch (err) {
          expect(logger.error).toHaveBeenCalledTimes(1);
        }
      });
    });
    describe("Test deletePgAccount", () => {
      it("it should execute all queries if required arguments are passed into deletePgAccount", async () => {
        mockClient.query.mockReturnValue(Promise.resolve());
        await deletePgAccount({ username: "username" });
        expect(mockClient.query).toHaveBeenCalledTimes(2);
      });
      it("it should not execute any queries in deletePgAccount if required arguments are not passed in", async () => {
        await deletePgAccount({});
        expect(mockClient.query).toHaveBeenCalledTimes(0);
      });
      it("it should check if logger.error is called at throw of deletePgAccount", async () => {
        try {
          await mockClient.query.mockReturnValue(Promise.reject());
          const resDeletePgAccount = await deletePgAccount({
            username: "username",
          });
          expect(resDeletePgAccount).rejects.toThrow();
        } catch (err) {
          expect(logger.error).toHaveBeenCalledTimes(1);
        }
      });
    });
  });

  describe("userHasPgAccount", () => {
    it("should return false if client.query has no rows", async () => {
      mockClient.query.mockReturnValue({
        rowCount: 0,
      });
      const result = await userHasPgAccount("testencodeduser");
      expect(result).toEqual(false);
      expect(mockClient.query.mock.calls[0][1]).toEqual(["testencodeduser"]);
    });

    it("should return false if client.query has a row", async () => {
      mockClient.query.mockReturnValue({
        rowCount: 1,
      });
      const result = await userHasPgAccount("testencodeduser");
      expect(result).toEqual(true);
    });
  });
});
