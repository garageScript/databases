jest.mock("../../lib/log");
const logGen = require("../../lib/log");
const logger = { error: jest.fn(), info: jest.fn() };
logGen.mockReturnValue(logger);

jest.mock("pg");
jest.mock("../../lib/log");
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
        await createPgAccount("username", "password");
        expect(mockClient.query).toHaveBeenCalledTimes(3);
        expect(mockClient.query.mock.calls[0]).toEqual([
          `CREATE DATABASE USERusername;`,
        ]);

        const createQueryRegex = new RegExp(
          /create user USERusername with encrypted password \$.\$password\$.\$/
        );
        expect(
          createQueryRegex.test(mockClient.query.mock.calls[1][0])
        ).toEqual(true);

        expect(mockClient.query.mock.calls[2]).toEqual([
          `GRANT ALL PRIVILEGES ON DATABASE USERusername TO USERusername`,
        ]);
      });
      it("it should not execute any queries in createPgAccount if required arguments are not passed in", async () => {
        await createPgAccount();
        expect(mockClient.query).toHaveBeenCalledTimes(0);
      });
      it("it should check if logger.error is called at throw of createPgAccount", async () => {
        try {
          await mockClient.query.mockReturnValue(Promise.reject());
          const resCreatePgAccount = await createPgAccount(
            "username",
            "password"
          );
          expect(resCreatePgAccount).rejects.toThrow();
        } catch (err) {
          expect(logger.error).toHaveBeenCalledTimes(1);
        }
      });
    });
    describe("Test deletePgAccount", () => {
      it("it should execute all queries if required arguments are passed into deletePgAccount", async () => {
        mockClient.query.mockReturnValue(Promise.resolve());
        await deletePgAccount("username");
        expect(mockClient.query).toHaveBeenCalledTimes(2);
        expect(mockClient.query.mock.calls[0]).toEqual([
          `DROP DATABASE IF EXISTS $1`,
          ["USERusername"],
        ]);
        expect(mockClient.query.mock.calls[1]).toEqual([
          `DROP USER IF EXISTS $1`,
          ["USERusername"],
        ]);
      });
      it("it should not execute any queries in deletePgAccount if required arguments are not passed in", async () => {
        await deletePgAccount();
        expect(mockClient.query).toHaveBeenCalledTimes(0);
      });
      it("it should check if logger.error is called at throw of deletePgAccount", async () => {
        try {
          await mockClient.query.mockReturnValue(Promise.reject());
          const resDeletePgAccount = await deletePgAccount(
            "username",
            "password"
          );
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
      expect(mockClient.query.mock.calls[0][1]).toEqual([
        "USERtestencodeduser",
      ]);
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
