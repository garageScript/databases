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

describe("testing es create account function", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should log error if account data is invalid", async () => {
    const account = {};
    try {
      await es.createAccount(account);
    } catch (err) {}
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
    try {
      await es.createAccount(account);
    } catch (err) {}
    return expect(logger.error).toHaveBeenCalled();
  });
  it("should log error if user already exists", async () => {
    const account = {
      username: "testuser",
      email: "em@i.l",
      password: "1234qwer",
    };
    fetch.mockReturnValue(
      Promise.resolve({
        json: () => {
          return { role: { created: false }, created: false };
        },
      })
    );
    try {
      await es.createAccount(account);
    } catch (err) {}
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
          return { role: { created: true }, created: true };
        },
      })
    );
    await es.createAccount(account);
    return expect(logger.info).toHaveBeenCalled();
  });
});

describe("testing es delete account function", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should log error if account data is invalid", async () => {
    const account = {};
    try {
      await es.deleteAccount(account);
    } catch (err) {}
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
    try {
      await es.deleteAccount(account);
    } catch (err) {}
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
    await es.deleteAccount(account);
    return expect(logger.info).toHaveBeenCalled();
  });
});

describe("testing es check account function", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should log error if account data is invalid", async () => {
    const account = {};
    try {
      await es.checkAccount(account);
    } catch (err) {}
    return expect(logger.error).toHaveBeenCalled();
  });
  it("should return false if index does not exist", async () => {
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
    const result = await es.checkAccount(account);
    return expect(result).toEqual(false);
  });
  it("should return true if index exists", async () => {
    const account = {
      username: "testuser",
      email: "em@i.l",
      password: "1234qwer",
    };
    fetch.mockReturnValue(
      Promise.resolve({
        json: () => {
          return { "testuser-example": {} };
        },
      })
    );
    const result = await es.checkAccount(account);
    return expect(result).toEqual(true);
  });
});
