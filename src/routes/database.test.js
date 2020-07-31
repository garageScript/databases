jest.mock("../../sequelize/db");

const db = require("../../sequelize/db");
<<<<<<< HEAD:src/routes/database.test.js
const { database } = require("./database");
=======
const { postgres,landingpage } = require("./renderRoutes");
>>>>>>> 13a0ea1fd35abe9ed29dbdd5dd432485ff9b1135:src/routes/renderRoutes.test.js

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

<<<<<<< HEAD:src/routes/database.test.js
describe("Testing render router", () => {
  test("database function should call res.redirect if session is undefined", async () => {
    await database(mockRequest, mockResponse);
=======
describe("Testing postgres router", () => {
  test("postgres function should call res.redirect if session is undefined", async () => {
    await postgres(mockRequest, mockResponse);
>>>>>>> 13a0ea1fd35abe9ed29dbdd5dd432485ff9b1135:src/routes/renderRoutes.test.js
    expect(mockResponse.redirect).toHaveBeenCalled();
  });
  test("database function should call res.render if session user is found", async () => {
    mockRequest.session.username = "testuser";
    mockRequest.session.userid = 99999999;
    const userAccount = {
      dbPassword: "testdbpw",
    };
    mockFindOne.mockReturnValue(userAccount);
    await postgres(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalled();
<<<<<<< HEAD:src/routes/database.test.js
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
=======
  })
>>>>>>> 13a0ea1fd35abe9ed29dbdd5dd432485ff9b1135:src/routes/renderRoutes.test.js
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



