jest.mock("../../sequelize/db");

const db = require("../../sequelize/db");
const { postgres, mongodb, neo4j } = require("./renderRoutes");

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

describe("Testing render router", () => {
  test("postgres function should call res.redirect if session is undefined", async () => {
    await postgres(mockRequest, mockResponse);
    expect(mockResponse.redirect).toHaveBeenCalled();
  });
  test("postgres function should call res.render if session user is found", async () => {
    mockRequest.session.username = "testuser";
    mockRequest.session.userid = 99999999;
    const userAccount = {
      dbPassword: "testdbpw",
    };
    mockFindOne.mockReturnValue(userAccount);
    await postgres(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalled();
  });

  test("mongodb function should return response", async () => {
    const mockRequest = {
      session: {},
    };
    await mongodb(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalled();
  });
  test("neo4j function should return response", async () => {
    const mockRequest = {
      session: {},
    };
    await neo4j(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalled();
  });
});
