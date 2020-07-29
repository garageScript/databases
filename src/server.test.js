jest.mock("./routes/userRoutes");
jest.mock("./routes/renderRoutes");
jest.mock("express");
jest.mock("mailgun-js");
jest.mock("../sequelize/db");

const express = require("express");
const dbModule = require("../sequelize/db");
const userRoutes = require("./routes/userRoutes");
const renderRoutes = require("./routes/renderRoutes");

userRoutes.createUser = jest.fn();
userRoutes.loginUser = jest.fn();
userRoutes.logoutUser = jest.fn();

userRoutes.deleteUser = jest.fn();
userRoutes.resetUserPassword = jest.fn();
userRoutes.updateDBPassword = jest.fn();

renderRoutes.postgres = jest.fn();
renderRoutes.mongodb = jest.fn();
renderRoutes.neo4j = jest.fn();
// router functions should be mocked before requiring server
const { startServer, stopServer, getApp } = require("./server");

dbModule.start = jest.fn();
dbModule.close = jest.fn();

const app = {
  set: () => {},
  use: () => {},
  get: jest.fn(),
  patch: jest.fn(),
  post: jest.fn(),
  delete: jest.fn(),
  listen: jest.fn().mockImplementation((port, callback) => callback()),
  name: "Carl Sagan",
};
express.mockReturnValue(app);

describe("Testing the server", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test("getApp should return null when startServer has not been called", () => {
    const result = getApp();
    expect(result).toBe(null);
  });
  test("getApp should return an express server after startServer has been called", async () => {
    await startServer();
    const result = getApp();
    expect(result.name).toEqual("Carl Sagan");
  });
  test("startServer should return an object", async () => {
    const result = await startServer(1000);
    expect(result.listen.mock.calls[0][0]).toBe(1000);
  });
  test("stopServer should call server.close", async () => {
    const server = { close: jest.fn().mockImplementation((a) => a()) };
    app.listen.mockImplementation((a, b) => {
      // Need to setTimeout so the promise resolves
      //   is called after the function returns
      setTimeout(b, 1);
      return server;
    });
    await startServer();
    await stopServer();
    expect(dbModule.close).toHaveBeenCalled();
    expect(server.close).toHaveBeenCalled();
  });
});

describe("Testing user routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test("should call user router functions", async () => {
    await startServer();

    await app.patch.mock.calls[0][1]();
    expect(userRoutes.updateDBPassword).toHaveBeenCalled();

    await app.post.mock.calls[0][1]();
    expect(userRoutes.resetPasswordEmail).toHaveBeenCalled();

    await app.post.mock.calls[1][1]();
    expect(userRoutes.createUser).toHaveBeenCalled();

    await app.post.mock.calls[3][1]();
    expect(userRoutes.userResetPassword).toHaveBeenCalled();

    await app.post.mock.calls[2][1]();
    expect(userRoutes.loginUser).toHaveBeenCalled();

    await app.delete.mock.calls[0][1]();
    expect(userRoutes.deleteUser).toHaveBeenCalled();

    await app.delete.mock.calls[1][1]();
    expect(userRoutes.logoutUser).toHaveBeenCalled();
  });
});

describe("Testing render routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test("should call render router functions", async () => {
    await startServer();
    await app.get.mock.calls[6][1]();
    expect(renderRoutes.postgres).toHaveBeenCalled();
    await app.get.mock.calls[7][1]();
    expect(renderRoutes.mongodb).toHaveBeenCalled();
    await app.get.mock.calls[8][1]();
    expect(renderRoutes.neo4j).toHaveBeenCalled();
  });
});
