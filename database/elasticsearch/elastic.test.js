jest.mock("node-fetch");
jest.mock("dotenv");
jest.mock("../../lib/log");
const logGen = require("../../lib/log");
const logger = {
  info: jest.fn(),
  error: jest.fn(),
};
logGen.mockReturnValue(logger);

const fetch = require("node-fetch");
const es = require("./elastic");

describe("testing es creat user function", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should log error if account data is invalid", async () => {
    const account = {};
    await es.createUser(account);
    return expect(logger.error).toHaveBeenCalled();
  });
  it("should log error if creating user fails", async () => {
    const account = {
      username: "testuser",
      email: "em@i.l",
      password: "1234qwer",
    };
    fetch.mockReturnValue(
      Promise.resolve({
        json: () => {
          return { error: "error" };
        },
      })
    );
    await es.createUser(account);
    return expect(logger.error).toHaveBeenCalled();
  });
  it("should log info if creating user seccess", async () => {
    const account = {
      username: "testuser",
      email: "em@i.l",
      password: "1234qwer",
    };
    fetch.mockReturnValue(
      Promise.resolve({
        json: () => {
          return {};
        },
      })
    );
    await es.createUser(account);
    return expect(logger.info).toHaveBeenCalled();
  });
});

describe("testing es delete user function", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should log error if account data is invalid", async () => {
    const account = {};
    await es.deleteUser(account);
    return expect(logger.error).toHaveBeenCalled();
  });
  it("should log error if deleting user fails", async () => {
    const account = {
      username: "testuser",
      email: "em@i.l",
      password: "1234qwer",
    };
    fetch.mockReturnValue(
      Promise.resolve({
        json: () => {
          return { error: "error" };
        },
      })
    );
    await es.deleteUser(account);
    return expect(logger.error).toHaveBeenCalled();
  });
  it("should log info if deleting user seccess", async () => {
    const account = {
      username: "testuser",
      email: "em@i.l",
      password: "1234qwer",
    };
    fetch.mockReturnValue(
      Promise.resolve({
        json: () => {
          return { found: true };
        },
      })
    );
    await es.deleteUser(account);
    return expect(logger.info).toHaveBeenCalled();
  });
});
