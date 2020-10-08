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
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test("when database function is called with non-logged in user and Arango parameter", async () => {
    mockRequest.params.database = "Arango";
    await database(mockRequest, mockResponse);
    expect(mockResponse.render.mock.calls[0][1].username).toBeFalsy();
    expect(mockResponse.render.mock.calls[0][1].dbHost).toEqual(
      process.env.ARANGO_URL
    );
  });
  test("when database function is called with non-logged in user and Postgres parameter", async () => {
    mockRequest.params.database = "Postgres";
    await database(mockRequest, mockResponse);
    expect(mockResponse.render.mock.calls[0][1].username).toBeFalsy();
    expect(mockResponse.render.mock.calls[0][1].dbHost).toEqual(
      process.env.HOST
    );
  });
  test("when database function is called with non-logged in user and Elasticsearch parameter", async () => {
    mockRequest.params.database = "Elasticsearch";
    await database(mockRequest, mockResponse);
    expect(mockResponse.render.mock.calls[0][1].username).toBeFalsy();
    expect(mockResponse.render.mock.calls[0][1].dbHost).toEqual(
      process.env.ES_HOST
    );
  });
  test("when database function is called with logged in user and Arango parameter", async () => {
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
