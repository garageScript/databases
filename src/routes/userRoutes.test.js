jest.mock("mailgun-js");
jest.mock("../../lib/users");
jest.mock("../../sequelize/db");
jest.mock("../../database/postgres/pg");

const db = require("../../sequelize/db");
const {
  resetPasswordEmail,
  createUser,
  deleteUser,
  loginUser,
  logoutUser,
  userResetPassword,
  updateDBPassword,
  createDatabase,
} = require("./userRoutes");

const {
  sendPasswordResetEmail,
  signUp,
  logIn,
  resetUserPassword,
  setDBPassword,
} = require("../../lib/users");

const pgModule = require("../../database/postgres/pg");

const mockFindOne = jest.fn();

db.getModels = () => {
  return {
    Accounts: {
      findOne: mockFindOne,
    },
  };
};

const res = {
  status: jest.fn().mockImplementation(() => {
    return res;
  }),
  json: jest.fn(),
};

describe("Testing resetPasswordEmail function", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should send 400 error if req body does not have email", async () => {
    const req = {
      body: {},
    };

    await resetPasswordEmail(req, res);
    expect(res.status.mock.calls[0][0]).toEqual(400);
    expect(res.json.mock.calls[0][0]).toEqual({
      error: { message: "invalid input" },
    });
  });

  test("Should send 400 error if user account does not exist with provided email", async () => {
    const req = {
      body: {
        email: "hello@world.com",
      },
    };

    await resetPasswordEmail(req, res);
    expect(res.status.mock.calls[0][0]).toEqual(400);
    expect(res.json.mock.calls[0][0]).toEqual({
      error: { message: "Account does not exist" },
    });
  });

  test("should send 500 error if send password throws error", async () => {
    const userAccount = {
      id: 1,
      email: "hello@world.com",
    };

    mockFindOne.mockReturnValue(userAccount);

    const req = {
      body: {
        email: "hello@world.com",
      },
    };

    sendPasswordResetEmail.mockImplementation(() => {
      throw new Error("error");
    });

    await resetPasswordEmail(req, res);
    expect(res.status.mock.calls[0][0]).toEqual(500);
    expect(res.json.mock.calls[0][0]).toEqual({
      error: { message: "Email delivery failed. Please try again" },
    });
  });

  test("should send 200 success if send password is successful", async () => {
    const userAccount = {
      id: 2,
      email: "hello@world.com",
    };

    mockFindOne.mockReturnValue(userAccount);

    const req = {
      body: {
        email: "hello@world.com",
      },
      session: {},
    };

    sendPasswordResetEmail.mockImplementation(() => {
      return {
        dataValues: {
          email: "hello@world.com",
          password: "as1f6lurdh8f632la",
        },
      };
    });

    await resetPasswordEmail(req, res);
    expect(res.status.mock.calls[0][0]).toEqual(200);
    expect(res.json.mock.calls[0][0].email).toEqual("hello@world.com");
  });
});

describe("Testing createUser function", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should send error if sign up fails", async () => {
    signUp.mockImplementation(() => {
      throw new Error("Error");
    });
    const req = {
      body: {
        email: "em@i.l",
      },
    };
    await createUser(req, res);
    expect(res.status.mock.calls[0][0]).toEqual(400);
    return expect(res.json.mock.calls[0][0].error.message).toEqual("Error");
  });
  it("should create user account", async () => {
    signUp.mockImplementation(() => {
      return {
        dataValues: {
          email: "em@i.l",
        },
      };
    });
    const req = {
      body: {
        email: "em@i.l",
      },
    };
    await createUser(req, res);
    expect(res.status.mock.calls[0][0]).toEqual(200);
    return expect(res.json.mock.calls[0][0].email).toEqual("em@i.l");
  });
});

describe("Testing deleteUser function", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should send error if input is invalid", async () => {
    const req = {
      params: { id: null },
    };
    await deleteUser(req, res);
    expect(res.status.mock.calls[0][0]).toEqual(400);
    return expect(res.json.mock.calls[0][0].error.message).toEqual(
      "user id was not provided"
    );
  });
  it("should send error if account is not found", async () => {
    const req = {
      params: { id: 99999999 },
    };
    mockFindOne.mockReturnValue(null);
    await deleteUser(req, res);
    expect(res.status.mock.calls[0][0]).toEqual(404);
    return expect(res.json.mock.calls[0][0].error.message).toEqual(
      "Cannot find user"
    );
  });
  it("should send error if user session does not match", async () => {
    const req = {
      params: { id: 99999999 },
      session: { userid: 99999998 },
    };
    mockFindOne.mockReturnValue({
      email: "em@i.l",
    });
    await deleteUser(req, res);
    expect(res.status.mock.calls[0][0]).toEqual(403);
    return expect(res.json.mock.calls[0][0].error.message).toEqual(
      "Username does not match to cookie"
    );
  });
  it("should delete user", async () => {
    const req = {
      params: { id: 99999999 },
      session: { userid: 99999999 },
    };
    mockFindOne.mockReturnValue({
      id: 99999999,
      destroy: () => {},
      dataValues: {
        id: 99999999,
        password: "as1f6lurdh8f632la",
      },
    });
    await deleteUser(req, res);
    expect(res.status.mock.calls[0][0]).toEqual(200);
    return expect(res.json.mock.calls[0][0].id).toEqual(99999999);
  });
  it("should send error if delete user fails", async () => {
    const req = {
      params: { id: 99999999 },
      session: { email: "em@i.l" },
    };
    mockFindOne.mockReturnValue({
      email: "em@i.l",
      destroy: () => {
        throw new Error("Error");
      },
    });
    await deleteUser(req, res);
    expect(res.status.mock.calls[0][0]).toEqual(500);
    return expect(res.json.mock.calls[0][0].error.message).toEqual(
      "Deleting user failed. Please try again"
    );
  });
});

describe("testing upDBPassword function", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should send 400 error if invalid input of userid and password", async () => {
    const req = {
      session: { userid: null },
      body: { password: null },
    };
    await updateDBPassword(req, res);
    expect(res.status.mock.calls[0][0]).toEqual(400);
    expect(res.json.mock.calls[0][0].error.message).toEqual(
      "invalid input of email and password"
    );
  });
  it("should send 400 error if user account does not exist", async () => {
    mockFindOne.mockReturnValue(undefined);
    const req = {
      session: { userid: 99999999 },
      body: { password: 88900900 },
    };
    await updateDBPassword(req, res);
    expect(res.status.mock.calls[0][0]).toEqual(400);
    expect(res.json.mock.calls[0][0].error.message).toEqual(
      "account does not exist"
    );
  });
  it("should send 200 success and update user password", async () => {
    const userAccount = {
      email: "em@i.l",
    };
    mockFindOne.mockReturnValue(userAccount);
    const req = {
      session: { userid: 99999999 },
      body: { password: 12345678 },
    };
    setDBPassword.mockImplementation(() => {
      return {
        dataValues: {
          id: 12,
          password: 12345678,
        },
      };
    });
    await updateDBPassword(req, res);
    expect(res.status.mock.calls[0][0]).toEqual(200);
    expect(res.json.mock.calls[0][0].id).toEqual(12);
  });

  it("should send 500 error if password update failed", async () => {
    const userAccount = {
      email: "em@i.l",
    };
    mockFindOne.mockReturnValue(userAccount);
    const req = {
      session: { userid: 99999999 },
      body: { password: "noexist" },
    };
    setDBPassword.mockImplementation(() => {
      throw new Error("error");
    });
    await updateDBPassword(req, res);
    expect(res.status.mock.calls[0][0]).toEqual(500);
    expect(res.json.mock.calls[0][0].error.message).toEqual(
      "Password update failed. Please try again"
    );
  });
});

describe("testing loginUser function", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should send error if login fails", async () => {
    logIn.mockImplementation(() => {
      throw new Error("Error");
    });
    const req = {
      body: {
        email: "em@i.l",
        password: "1q2w3e4r",
      },
    };
    await loginUser(req, res);
    expect(res.status.mock.calls[0][0]).toEqual(500);
    return expect(res.json.mock.calls[0][0].error.message).toEqual(
      "Login user failed. Please try again"
    );
  });
  it("should login user", async () => {
    logIn.mockImplementation(() => {
      return {
        email: "em@i.l",
        dataValues: {
          email: "em@i.l",
          password: "iehpuf6712hifsd1",
        },
      };
    });
    const req = {
      body: {
        email: "em@i.l",
        password: "1q2w3e4r",
      },
      session: {},
    };
    await loginUser(req, res);
    expect(res.status.mock.calls[0][0]).toEqual(200);
    return expect(res.json.mock.calls[0][0].email).toEqual("em@i.l");
  });
});

describe("testing logoutUser function", () => {
  it("should clear session", () => {
    const req = {
      session: { userid: 99999999 },
    };
    logoutUser(req, res);
    expect(req.session.userid).toEqual("");
  });
});

describe("testing userResetPassword", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should return email if success", async () => {
    const userInfo = {
      id: 2,
      email: "em@i.l",
      password: "hello",
      dataValues: {
        id: 2,
        email: "em@i.l",
        password: "hello",
      },
    };

    resetUserPassword.mockReturnValue(userInfo);

    const req = {
      body: {
        token: userInfo,
        password: "testPassword",
      },
      session: {
        email: "em@i.l",
      },
    };

    await userResetPassword(req, res);
    return expect(res.json.mock.calls[0][0]).toEqual({
      password: null,
      id: 2,
      email: "em@i.l",
    });
  });
  it("should return error if reset user password fails", async () => {
    const userInfo = {
      id: 3,
    };

    resetUserPassword.mockImplementation(() => {
      throw new Error("testing error");
    });

    const req = {
      body: {
        token: userInfo,
        password: "passwordTest",
      },
    };

    await userResetPassword(req, res);
    return expect(res.json.mock.calls[0][0].error.message).toEqual(
      "Reset user password failed. Please try again"
    );
  });
});

describe("should test creating a database", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should return error if there is not a email", async () => {
    const req = {
      session: {
        email: null,
        dbPassword: "Google",
      },
    };

    await createDatabase(req, res);
    return expect(res.json.mock.calls[0][0].error.message).toEqual(
      "You must be signed in to create a database"
    );
  });
  it("should return error if there is not a password", async () => {
    const req = {
      session: {
        email: "testm@i.l",
        dbPassword: null,
      },
    };

    await createDatabase(req, res);
    return expect(res.json.mock.calls[0][0].error.message).toEqual(
      "You must use your database password to create a database"
    );
  });
  it("should return success if there is a email", async () => {
    const req = {
      session: {
        email: "testm@i.l",
      },
    };

    pgModule.createPgAccount.mockReturnValue(Promise.resolve());

    db.getModels = () => {
      return {
        Accounts: {
          findOne: () => {
            return {
              email: "testm@i.l",
              dbPassword: "Google",
            };
          },
        },
      };
    };

    await createDatabase(req, res);
    return expect(res.json.mock.calls[0][0].success.message).toEqual(
      "Create Database success"
    );
  });

  it("should throw and error if pgModule fails to create database", async () => {
    const req = {
      session: {
        email: "testm@i.l",
      },
    };

    db.getModels = () => {
      return {
        Accounts: {
          findOne: () => {
            return {
              email: "testm@i.l",
              dbPassword: "Google",
            };
          },
        },
      };
    };

    pgModule.createPgAccount.mockReturnValue(
      Promise.reject("cannot create account")
    );

    await createDatabase(req, res);
    return expect(res.json.mock.calls[0][0].error.message).toEqual(
      "Database creation was not implemented"
    );
  });
});
