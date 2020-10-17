jest.setTimeout(1000000);

const { startServer, stopServer } = require("../../src/server");
const fetch = require("node-fetch");
require("dotenv").config();

describe("test welcome page", () => {
  const testPort = process.env.TEST_PORT || 20200;
  const baseUrl = `http://localhost:${testPort}/`;
  const OLD_ENV = process.env;
  beforeEach(async () => {
    await startServer(testPort);
    process.env = { ...OLD_ENV };
  });
  afterEach(async () => {
    process.env = OLD_ENV;
    await stopServer();
  });

  test("should render welcome page correctly", async () => {
    process.env = { ...process.env, NODE_ENV: "CI" };
    const result = await fetch(baseUrl).then((r) => r.text());
    expect(result).toMatchSnapshot();
  });

  test("should render setDBpassword page correctly", async () => {
    process.env = { ...process.env, NODE_ENV: "dev" };
    const result = await fetch(baseUrl + "setDBpassword").then((r) => r.text());
    expect(result).toMatchSnapshot();
  });

  test("should render sign in page correctly", async () => {
    process.env = { ...process.env, NODE_ENV: "dev" };
    const result = await fetch(baseUrl + "signin").then((r) => r.text());
    expect(result).toMatchSnapshot();
  });

  test("should render sign up page correctly", async () => {
    process.env = { ...process.env, NODE_ENV: "dev" };
    const result = await fetch(baseUrl + "signup").then((r) => r.text());
    expect(result).toMatchSnapshot();
  });

  test("should render setPassword page correctly", async () => {
    process.env = { ...process.env, NODE_ENV: "dev" };
    const result = await fetch(baseUrl + "setPassword/token").then((r) =>
      r.text()
    );
    expect(result).toMatchSnapshot();
  });

  test("should render resetPassword page correctly", async () => {
    process.env = { ...process.env, NODE_ENV: "dev" };
    const result = await fetch(baseUrl + "resetPassword").then((r) => r.text());
    expect(result).toMatchSnapshot();
  });

  test("should render postgres page correctly", async () => {
    process.env = { ...process.env, NODE_ENV: "CI" };
    const result = await fetch(baseUrl + "tutorial/Postgres").then((r) =>
      r.text()
    );
    expect(result).toMatchSnapshot();
  });

  test("should render elasticsearch page correctly", async () => {
    process.env = { ...process.env, NODE_ENV: "CI" };
    const result = await fetch(baseUrl + "tutorial/Elasticsearch").then((r) =>
      r.text()
    );
    expect(result).toMatchSnapshot();
  });

  test("should render arango page correctly", async () => {
    process.env = { ...process.env, NODE_ENV: "CI" };
    const result = await fetch(baseUrl + "tutorial/Arango").then((r) =>
      r.text()
    );
    expect(result).toMatchSnapshot();
  });
});
