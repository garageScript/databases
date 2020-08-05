// jest.mock("express-session");
const session = require("express-session");
const { startServer, stopServer } = require("../../src/server");
const fetch = require("node-fetch");

/*
const sessionObj = { username: null };
session.mockImplementation((req, res, next) => {
  req.session = sessionObj;
  next(req, res);
});
*/

describe("test welcome page", () => {
  const testPort = process.env.TEST_PORT || 20200;
  const baseUrl = `http://localhost:${testPort}/`;

  beforeAll(async () => {
    await startServer(testPort);
  });
  afterAll(async () => {
    await stopServer();
  });

  test("should render welcome page correctly", async () => {
    const result = await fetch(baseUrl).then((r) => r.text());
    expect(result).toMatchSnapshot();
  });

  test("should render setDBpassword page correctly", async () => {
    const result = await fetch(baseUrl + "setDBpassword").then((r) => r.text());
    expect(result).toMatchSnapshot();
  });

  test("should render sign in page correctly", async () => {
    const result = await fetch(baseUrl + "signin").then((r) => r.text());
    expect(result).toMatchSnapshot();
  });

  test("should render sign up page correctly", async () => {
    const result = await fetch(baseUrl + "signup").then((r) => r.text());
    expect(result).toMatchSnapshot();
  });

  test("should render setPassword page correctly", async () => {
    const result = await fetch(baseUrl + "setPassword/token").then((r) =>
      r.text()
    );
    expect(result).toMatchSnapshot();
  });

  test("should render resetPassword page correctly", async () => {
    const result = await fetch(baseUrl + "resetPassword").then((r) => r.text());
    expect(result).toMatchSnapshot();
  });

  test("should render postgres page correctly", async () => {
    const result = await fetch(baseUrl + "postgres").then((r) => r.text());
    expect(result).toMatchSnapshot();
  });
});
