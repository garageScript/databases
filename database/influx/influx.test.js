jest.mock("../../lib/log");
const logGen = require("../../lib/log");
const logger = { error: jest.fn(), info: jest.fn() };
logGen.mockReturnValue(logger);
jest.mock("dotenv");
require("dotenv").config();
jest.mock("influx");
const { InfluxDB } = require("influx");
const influx = require("influx");
const {
  startInflux,
  createAccount,
  deleteAccount,
  checkAccount,
} = require("./influx");
describe("test InfluxDB", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  const mockClient = {
    InfluxDB: jest.fn(),
    createUser: jest.fn(),
    createDatabase: jest.fn(),
    grantPrivilege: jest.fn(),
    dropUser: jest.fn(),
    dropDatabase: jest.fn(),
    getUsers: jest.fn(),
  };
  const user = { username: "username", dbPassword: "password" };
  InfluxDB.mockImplementation(function () {
    return mockClient;
  });
  it("should start influx client", () => {
    startInflux();
    expect(influx.InfluxDB).toHaveBeenCalledTimes(1);
  });
  it("should use global variables", () => {
    startInflux();
    expect(influx.InfluxDB.mock.calls[0][0].host).toEqual("localhost");
    expect(influx.InfluxDB.mock.calls[0][0].port).toEqual(8086);
  });
  describe("createAccount", () => {
    it("should sucessfully create new account", async () => {
      await createAccount(user);
      expect(mockClient.createUser).toHaveBeenCalledTimes(1);
      expect(mockClient.createDatabase).toHaveBeenCalledTimes(1);
      expect(mockClient.grantPrivilege).toHaveBeenCalledTimes(1);
    });
    it("should call logger in case of an error", async () => {
      try {
        mockClient.createUser.mockReturnValue(Promise.reject());
        expect(await createAccount(user)).rejects.toThrow();
      } catch (err) {
        expect(logger.error).toHaveBeenCalledTimes(1);
      }
    });
    it("should return if no account argument was provided", async () => {
      const res = await createAccount({});
      expect(res).toEqual(undefined);
    });
  });
  describe("deleteAccount", () => {
    it("should sucessfully delete account", async () => {
      await deleteAccount(user);
      expect(mockClient.dropUser).toHaveBeenCalledTimes(1);
      expect(mockClient.dropDatabase).toHaveBeenCalledTimes(1);
    });
    it("should throw error to invalid credentials", async () => {
      try {
        mockClient.dropUser.mockReturnValue(Promise.reject());
        expect(await deleteAccount(user)).rejects.toThrow();
      } catch (err) {
        expect(logger.error).toHaveBeenCalledTimes(1);
      }
    });
    it("should return if no username was provided", async () => {
      const res = await deleteAccount({});
      expect(res).toEqual(undefined);
    });
  });
  describe("checkAccount", () => {
    it("should return true if account exists", async () => {
      mockClient.getUsers.mockReturnValue(["name", "username"]);
      const res = await checkAccount("username");
      expect(mockClient.getUsers).toHaveBeenCalledTimes(1);
      expect(res).toEqual(true);
    });
    it("should return false if account doesnt exitsts", async () => {
      mockClient.getUsers.mockReturnValue([]);
      const res = await checkAccount(user);
      expect(mockClient.getUsers).toHaveBeenCalledTimes(1);
      expect(res).toEqual(false);
    });
    it("should throw an error", async () => {
      try {
        mockClient.getUsers.mockReturnValue(Promise.reject());
        expect(await checkAccount(user)).rejects.toThrow();
      } catch (err) {
        expect(logger.error).toHaveBeenCalledTimes(1);
      }
    });
    it("should return if no username was provided", async () => {
      const res = await checkAccount();
      expect(res).toEqual(undefined);
    });
  });
});
