jest.mock("../../sequelize/db");

const db = require("../../sequelize/db");
const { postgres,landingpage } = require("./renderRoutes");

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

describe("Testing postgres router", () => {
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
  })
});

describe("Testing landingpage router", () => {
  test("landingpage function should call res.render welcome if session is undefined", async () => {
    await landingpage(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalled();
  })
  test("landingpage function should call res.render if session user is not found", async () => {
    mockRequest.session.username = "testuser";
    mockFindOne.mockReturnValue(undefined);
    await landingpage(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalled();
  })
  test("landingpage function should call res.render if session user is found, no dbpassword set", async () => {
    mockRequest.session.username = "testuser";
    mockRequest.session.userid = 99999999;
    const userAccount = {
      id:99999999
    };
    mockFindOne.mockReturnValue(userAccount);
    await landingpage(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalled();
  })
  test("landingpage function should call res.render if session user is found, and dbpasswrod is set", async () => {
    mockRequest.session.username = "testuser";
    mockRequest.session.userid = 99999999;
    const userAccount = {
      dbPassword: "testdbpw",
    };
    mockFindOne.mockReturnValue(userAccount);
    await landingpage(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalled();
  })

});



