jest.mock("../../sequelize/db");
jest.mock("../../database/elasticsearch/elastic");
jest.mock("../../database/postgres/pg");

const db = require("../../sequelize/db");
const es = require("../../database/elasticsearch/elastic");
const { postgres, elastic } = require("./renderRoutes");

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
  redirect: jest.fn(),
};
const mockRequest = {
  session: {},
};

es.checkAccount = jest.fn();

describe("Testing postgres router", () => {
  test("postgres function should call res.redirect if session is undefined", async () => {
    await postgres(mockRequest, mockResponse);
    expect(mockResponse.redirect).toHaveBeenCalled();
  });
  test("postgres function should call res.render if session user is found", async () => {
    mockRequest.session.email = "em@i.l";
    mockRequest.session.userid = 99999999;
    const userAccount = {
      dbPassword: "testdbpw",
    };
    mockFindOne.mockReturnValue(userAccount);
    await postgres(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalled();
  });
});

describe("Testing elastic router", () => {
  test("elastic function should call res.redirect if session is undefined", async () => {
    mockRequest.session.email = null;
    mockRequest.session.userid = null;
    await elastic(mockRequest, mockResponse);
    expect(mockResponse.redirect).toHaveBeenCalled();
  });
  test("elastic function should call res.render if session user is found", async () => {
    mockRequest.session.email = "em@i.l";
    mockRequest.session.userid = 99999999;
    const userAccount = {
      dbPassword: "testdbpw",
    };
    mockFindOne.mockReturnValue(userAccount);
    await elastic(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalled();
  });
});
