jest.mock("../../sequelize/db");
jest.mock("../../database/elasticsearch/elastic");
jest.mock("../../database/postgres/pg");
jest.mock("../../database/arango/arango");
jest.mock("arangojs");
require("dotenv").config();
const db = require("../../sequelize/db");
const { database } = require("./renderRoutes");
const mockFindOne = jest.fn();
db.getModels = () => {
  return {
    Accounts: {
      findOne: mockFindOne,
    },
  };
};
const mockResponse = {
  render: jest.fn(),
};
const mockRequest = {
  params: {},
  session: {},
};
describe("Testing database router", () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...OLD_ENV };
  });
  afterEach(() => {
    process.env = OLD_ENV;
  });
  test("should render correct CI hostname to front-end", async () => {
    mockRequest.params.database = "Arango";
    process.env = { ...process.env, NODE_ENV: "CI" };
    await database(mockRequest, mockResponse);
    expect(mockResponse.render.mock.calls[0][1].username).toBeFalsy();
    expect(mockResponse.render.mock.calls[0][1].dbHost).toEqual(
      "arangodb.learndatabases.dev"
    );
  });
  test("should render correct CI hostname to frontend elasticsearch", async () => {
    process.env = { ...process.env, NODE_ENV: "CI" };
    mockRequest.params.database = "Elasticsearch";
    await database(mockRequest, mockResponse);
    expect(mockResponse.render.mock.calls[0][1].username).toBeFalsy();
    expect(mockResponse.render.mock.calls[0][1].dbHost).toEqual(
      "elastic.learndatabases.dev"
    );
  });
  test("should render correct CI hostname to frontend postgres", async () => {
    process.env = { ...process.env, NODE_ENV: "CI" };
    mockRequest.params.database = "Postgres";
    await database(mockRequest, mockResponse);
    expect(mockResponse.render.mock.calls[0][1].username).toBeFalsy();
    expect(mockResponse.render.mock.calls[0][1].dbHost).toEqual(
      "learndatabases.dev"
    );
  });
  test("when database function is called with non-logged in user and Arango parameter", async () => {
    process.env = { ...process.env, NODE_ENV: "dev" };
    mockRequest.params.database = "Arango";
    await database(mockRequest, mockResponse);
    expect(mockResponse.render.mock.calls[0][1].username).toBeFalsy();
    expect(mockResponse.render.mock.calls[0][1].dbHost).toEqual(
      process.env.ARANGO_URL
    );
  });
  test("when database function is called with non-logged in user and Postgres parameter", async () => {
    process.env = { ...process.env, NODE_ENV: "dev" };
    mockRequest.params.database = "Postgres";
    await database(mockRequest, mockResponse);
    expect(mockResponse.render.mock.calls[0][1].username).toBeFalsy();
    expect(mockResponse.render.mock.calls[0][1].dbHost).toEqual(
      process.env.HOST
    );
  });
  test("when database function is called with non-logged in user and Elasticsearch parameter", async () => {
    process.env = { ...process.env, NODE_ENV: "dev" };
    mockRequest.params.database = "Elasticsearch";
    await database(mockRequest, mockResponse);
    expect(mockResponse.render.mock.calls[0][1].username).toBeFalsy();
    expect(mockResponse.render.mock.calls[0][1].dbHost).toEqual(
      process.env.ES_HOST
    );
  });
  test("when database function is called with logged in user and Arango parameter", async () => {
    process.env = { ...process.env, NODE_ENV: "dev" };
    mockRequest.session.userid = 999999;
    mockRequest.params.database = "Arango";
    mockFindOne.mockReturnValue({
      username: "testuser",
      dbPassword: "database",
    });
    await database(mockRequest, mockResponse);
    expect(mockResponse.render.mock.calls[0][1].username).toEqual("testuser");
    expect(mockResponse.render.mock.calls[0][1].dbHost).toEqual(
      process.env.ARANGO_URL
    );
  });
  test("when database function is called with logged in user and Postgres parameter", async () => {
    process.env = { ...process.env, NODE_ENV: "dev" };
    mockRequest.session.userid = 999999;
    mockRequest.params.database = "Postgres";
    mockFindOne.mockReturnValue({
      username: "testuser",
      dbPassword: "database",
    });
    await database(mockRequest, mockResponse);
    expect(mockResponse.render.mock.calls[0][1].username).toEqual("testuser");
    expect(mockResponse.render.mock.calls[0][1].dbHost).toEqual(
      process.env.HOST
    );
  });
  test("when database function is called with logged in user and Elasticsearch parameter", async () => {
    process.env = { ...process.env, NODE_ENV: "dev" };
    mockRequest.session.userid = 999999;
    mockRequest.params.database = "Elasticsearch";
    mockFindOne.mockReturnValue({
      username: "testuser",
      dbPassword: "database",
    });
    await database(mockRequest, mockResponse);
    expect(mockResponse.render.mock.calls[0][1].username).toEqual("testuser");
    expect(mockResponse.render.mock.calls[0][1].dbHost).toEqual(
      process.env.ES_HOST
    );
  });
});
