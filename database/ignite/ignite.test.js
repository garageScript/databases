jest.mock("apache-ignite-client");
jest.mock("../../lib/log");
const logGen = require("../../lib/log");
const logger = {
  info: jest.fn(),
  error: jest.fn(),
};
logGen.mockReturnValue(logger);
require("dotenv").config();
const {
  startIgnite,
  createAccount,
  deleteAccount,
  checkAccount,
  closeIgnite,
} = require("./ignite");

const IgniteClient = require("apache-ignite-client");
const mockClient = {
  cacheNames: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
  getOrCreateCache: jest.fn().mockReturnThis(),
  query: jest.fn(),
  destroyCache: jest.fn(),
};
IgniteClient.mockImplementation(() => mockClient);
const mockConfig = {
  setUserName: jest.fn().mockReturnThis(),
  setPassword: jest.fn().mockReturnThis(),
};
IgniteClient.IgniteClientConfiguration.mockImplementation(() => mockConfig);
describe("IgniteDb functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  const user = { username: "username", dbPassword: "password" };
  it("should start Ignite client", () => {
    startIgnite();
    expect(IgniteClient).toHaveBeenCalledTimes(1);
    expect(mockClient.connect).toHaveBeenCalledTimes(1);
    expect(IgniteClient.IgniteClientConfiguration).toHaveBeenCalledTimes(1);
    expect(mockConfig.setUserName.mock.calls[0][0]).toEqual("ignite");
    expect(mockConfig.setPassword.mock.calls[0][0]).toEqual("ignite");
  });
  it("should throw an error if starting client goes wrong", async () => {
    try {
      mockClient.connect.mockReturnValue(Promise.reject());
      expect(await startIgnite()).rejects.toThrow();
    } catch (err) {
      expect(logger.error).toHaveBeenCalledTimes(1);
    }
  });
  it("should close ignite client", () => {
    closeIgnite();
    expect(mockClient.disconnect).toHaveBeenCalledTimes(1);
  });
  it("should call logger error if closing client goes wrong", async () => {
    try {
      mockClient.disconnect.mockReturnValue(Promise.reject());
      await closeIgnite();
    } catch (err) {
      expect(logger.error).toHaveBeenCalledTimes(1);
    }
  });
  it("should check for existsting accounts", async () => {
    mockClient.cacheNames.mockReturnValue(["testName", "", "username"]);
    const result = await checkAccount(user.username);
    expect(mockClient.cacheNames).toHaveBeenCalledTimes(1);
    expect(result).toEqual(true);
  });
  it("should call logger error if checking for account goes wrong", async () => {
    try {
      mockClient.cacheNames.mockReturnValue(Promise.reject());
      await checkAccount(user.username);
    } catch (err) {
      expect(logger.error).toHaveBeenCalledTimes(1);
    }
  });
  it("should create new account", async () => {
    await createAccount(user);
    expect(mockClient.getOrCreateCache.mock.calls[0][0]).toEqual(user.username);
  });
  it("should delete user", async () => {
    await deleteAccount(user.username);
    expect(mockClient.getOrCreateCache.mock.calls[0][0]).toEqual(user.username);
    expect(mockClient.destroyCache.mock.calls[0][0]).toEqual(user.username);
  });
  it("should call logger error if creating a user goes wrong", async () => {
    try {
      mockClient.getOrCreateCache.mockReturnValue(Promise.reject());
      expect(await createAccount(user)).rejects.toThrow();
    } catch (err) {
      expect(logger.error).toHaveBeenCalledTimes(1);
    }
  });
  it("should return undefined if no arguments were provided", async () => {
    expect(await createAccount({})).toEqual(undefined);
    expect(await checkAccount("")).toEqual(undefined);
    expect(await deleteAccount("")).toEqual(undefined);
  });
  it("should calll logger error if deleting user goes wrong", async () => {
    try {
      mockClient.getOrCreateCache.mockReturnValue(Promise.reject());
      await deleteAccount(user.username);
    } catch (err) {
      expect(logger.error).toHaveBeenCalledTimes(1);
    }
  });
});
