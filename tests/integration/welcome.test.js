const { startServer, stopServer } = require("../../src/server");
const fetch = require("node-fetch");

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
<<<<<<< HEAD
=======

>>>>>>> 73bde9dc07d3f321bcb903e78f90e20b57d36309
  test("should render sign up page correctly", async () => {
    const result = await fetch(baseUrl + "signup").then((r) => r.text());
    expect(result).toMatchSnapshot();
  });
<<<<<<< HEAD
=======

  test("should render setPassword page correctly", async () => {
    const result = await fetch(baseUrl + "setPassword/token").then((r) =>
      r.text()
    );
    expect(result).toMatchSnapshot();
  });

  test("should render databases page correctly", async () => {
    const result = await fetch(baseUrl + "databases").then((r) => r.text());
    expect(result).toMatchSnapshot();
  });
>>>>>>> 73bde9dc07d3f321bcb903e78f90e20b57d36309
});
