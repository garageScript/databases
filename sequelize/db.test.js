jest.mock("sequelize");
jest.mock("../lib/log");
const { Sequelize } = require("sequelize");

const logGen = require("../lib/log");
const logger = {
  error: jest.fn(),
  info: jest.fn(),
};
logGen.mockReturnValue(logger);

const mockSequelize = {
  authenticate: jest.fn().mockReturnValue(Promise.resolve()),
  define: jest.fn(),
  sync: jest.fn().mockReturnValue(Promise.resolve()),
  close: jest.fn().mockReturnValue(Promise.resolve()),
};
Sequelize.mockImplementation(function () {
  return mockSequelize;
});

const { start, update, close, getModels, Account } = require("./db");

describe("Test sequelize", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    start();
  });
  it("should test how many times authenticate is called", () => {
    expect(logger.info).toHaveBeenCalledTimes(3);
    expect(mockSequelize.define).toHaveBeenCalledTimes(1);
    expect(mockSequelize.authenticate).toHaveBeenCalledTimes(1);
  });
  it("should test how many times close is called", () => {
    close();
    expect(logger.info).toHaveBeenCalledTimes(4);
    expect(mockSequelize.close).toHaveBeenCalledTimes(1);
  });
  it("should test throw on sequelize authentication", async () => {
    try {
      await mockSequelize.authenticate.mockReturnValue(Promise.reject());
      const resStart = await start();
      expect(resStart).rejects.toThrow();
    } catch (err) {
      expect(logger.error).toHaveBeenCalledTimes(1);
    }
  });
});

describe("Test models", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should get models when get models function is called", async () => {
    mockSequelize.authenticate.mockReturnValue(Promise.resolve());
    mockSequelize.define.mockReturnValue({ name: "ACCTest" });
    await start();
    const models = getModels();
    return expect(models).toEqual({
      Accounts: {
        name: "ACCTest",
      },
    });
  });
});
