jest.mock("mailgun-js");
jest.mock("../sequelize/db");
jest.mock("../services/mailer");
jest.mock("./log");
// require('./log') and mock should be before requiring everything

const logGen = require("./log");
const logger = {
  info: jest.fn(),
  error: jest.fn(),
};
logGen.mockReturnValue(logger);

const {
  signUp,
  logIn,
  sendPasswordResetEmail,
  resetUserPassword,
} = require("./users");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const db = require("../sequelize/db");
const email = require("../services/mailer");

email.sendPasswordResetEmail = jest.fn();

const genUserInfoWithPw = async (password) => {
  return {
    password: await bcrypt.hash(password, 10),
    email: "test.user@databases.com",
  };
};

const mockFindOne = jest.fn();
const mockCreateAccount = jest.fn();
const mockUpdate = jest.fn();

db.getModels = () => {
  return {
    Accounts: {
      findOne: mockFindOne,
      create: mockCreateAccount,
      update: mockUpdate,
    },
  };
};

describe("Sign up", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("function should reject if email is invalid", () => {
    const obj = {
      email: "1234@gmail",
    };
    return expect(signUp(obj)).rejects.toThrow("email must be a valid email");
  });

  it("should throw an error if accounts already exists", () => {
    mockFindOne.mockImplementation((query) => {
      if (query.where.email) return { email: "1234@gmail.com" };
      if (query.where.username) return false;
    });
    const obj = {
      email: "1234@gmail.com",
    };
    return expect(signUp(obj)).rejects.toThrow("this account already exists");
  });

  it("should throw an error if all possible usernames are taken", () => {
    mockFindOne.mockImplementation((query) => {
      if (query.where.email) return undefined;
      if (query.where.username) return true;
    });
    const obj = {
      email: "1234@gmail.com",
    };
    return expect(signUp(obj)).rejects.toThrow(
      "can not generate unique username"
    );
  });

  it("should create a user account", async () => {
    const dataValues = await genUserInfoWithPw("abcd1234");
    mockFindOne.mockImplementation((query) => {
      if (query.where.email) return undefined;
      if (query.where.username) return false;
    });
    mockCreateAccount.mockReturnValue({
      dataValues: dataValues,
      update: () => {},
    });
    const obj = {
      email: "test.user@databases.com",
    };
    const data = await signUp(obj);
    expect(data.dataValues).toEqual(dataValues);
  });

  it("should send a user set Password email", async () => {
    const obj = {
      id: 4,
      email: "em@i.l",
      update: jest.fn(),
    };

    await sendPasswordResetEmail(obj);
    expect(email.sendPasswordResetEmail.mock.calls.length).toEqual(1);
  });
});

describe("Log in", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should reject if user input is invalid", () => {
    const obj = {
      email: null,
      password: "password",
    };
    return expect(logIn(obj)).rejects.toThrow("User input is invalid");
  });
  it("should throw error if password doesn't match", async () => {
    const dataValues = await genUserInfoWithPw("abcd1234");
    mockFindOne.mockReturnValue({
      dataValues: dataValues,
    });
    const obj = {
      password: "1q2w3e4r",
      email: "test.user@databases.com",
    };
    return expect(logIn(obj)).rejects.toThrow("Password does not match");
  });
  it("should return user information if it logs in successfully", async () => {
    const dataValues = await genUserInfoWithPw("abcd1234");
    mockFindOne.mockReturnValue({
      dataValues: dataValues,
    });
    const obj = {
      password: "abcd1234",
      email: "test.user@databases.com",
    };
    const data = await logIn(obj);
    return expect(data.dataValues).toEqual(dataValues);
  });
  it("should throw error if user is not found", () => {
    mockFindOne.mockReturnValue(undefined);
    const obj = {
      password: "1q2w3e4r",
      email: "test.user@databases.com",
    };
    return expect(logIn(obj)).rejects.toThrow("User not found");
  });
});

describe("reset user password", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should throw an error without a token", async () => {
    const token = undefined;
    const password = "012345678";

    const result = await resetUserPassword(token, password);
    expect(result).toEqual(Error("no token for resetUserPassword"));
  });
  it("should throw an error without a password", async () => {
    const token = {};
    const password = undefined;

    const result = await resetUserPassword(token, password);
    expect(result).toEqual(Error("no password for resetUserPassword"));
  });
  it("should throw error if user account is not found in database", async () => {
    mockFindOne.mockReturnValue(undefined);
    const account = { id: 1 };
    const token = Buffer.from(JSON.stringify(account)).toString("base64");
    const password = "12345678910";

    const result = await resetUserPassword(token, password);
    expect(result).toEqual(Error("user account not found"));
  });
  it("should throw error if tokens do not match", async () => {
    const account = {
      id: 2,
      userToken: "abc",
    };
    const token = Buffer.from(JSON.stringify(account)).toString("base64");
    mockFindOne.mockReturnValue({
      id: 2,
      passwordReset: "234",
    });
    const password = "12345678910";

    const result = await resetUserPassword(token, password);
    expect(result).toEqual(Error("user tokens do not match"));
  });
  it("should throw error if token is no longer valid", async () => {
    const account = {
      id: 3,
      userToken: "1234",
    };
    mockFindOne.mockReturnValue({
      id: 3,
      passwordReset: "1234",
      tokenExpiration: Date.now() - 200,
    });
    const token = Buffer.from(JSON.stringify(account)).toString("base64");
    const password = "12345678910";

    const result = await resetUserPassword(token, password);
    expect(result).toEqual(Error("token is no longer valid"));
  });
  it("should update database with encrypted password", async () => {
    const account = {
      id: 4,
      userToken: "1234",
    };
    const mockUpdate = jest.fn();
    mockFindOne.mockReturnValue({
      id: 4,
      passwordReset: "1234",
      tokenExpiration: Date.now() + 200,
      update: mockUpdate,
    });
    const token = Buffer.from(JSON.stringify(account)).toString("base64");
    const password = "12345678910";

    await resetUserPassword(token, password);
    expect(mockUpdate.mock.calls.length).toEqual(1);
  });
});
