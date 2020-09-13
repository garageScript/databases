jest.mock("../../lib/log");
jest.mock("assert");
jest.mock("mongodb");
const mongodb = require("mongodb");

const logGen = require("../../lib/log");
const logger = { info: jest.fn(), error: jest.fn() };
logGen.mockReturnValue(logger);

const { startMongo, closeMongo } = require("./mongo");

describe("Test MongoDB DB", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mongodb.MongoClient.connect = (url, fn) => {
      fn(null, {});
    };
  });

  it("it should connect to MongoDB when startMongo is called", async () => {
    const data = await startMongo();
    expect(data).toEqual({ status: "success" });
  });
  it("it should reject if there is an error", async () => {
    mongodb.MongoClient.connect = (url, fn) => {
      fn(new Error("cannot connect"));
    };
    return expect(startMongo()).rejects.toThrowError("cannot connect");
  });
  it("it should call client close", async () => {
    const client = {
      close: jest.fn(),
    };
    mongodb.MongoClient.connect = (url, fn) => {
      fn(null, client);
    };
    await startMongo();
    await closeMongo();
    return expect(client.close).toHaveBeenCalledTimes(1);
  });
});
