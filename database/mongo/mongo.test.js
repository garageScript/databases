jest.mock("../../lib/log");
jest.mock("assert");
jest.mock("mongodb");

const logGen = require("../../lib/log");
const logger = { error: jest.fn() };
logGen.mockReturnValue(logger);

const MongoClient = require("mongodb").MongoClient;

const { startMongo, closeMongo, createMongo, deleteMongo } = require("./mongo");

describe("Test MongoDB DB", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  let mockClient = {
    connect: jest.fn().mockReturnValue(Promise.resolve()),
    end: jest.fn().mockReturnValue(Promise.resolve()),
    collection: jest.fn().mockReturnValue(Promise.resolve()),
  };

  describe("Test startMongoDB and closeMongoDB", () => {
    it("it should connect to MongoDB when startMongo is called", async () => {
      await startMongo;
      expect(mockClient.connect).toHaveBeenCalledTimes(1);
    });
    it("should call end when closing MongoDB", async () => {
      await closeMongo;
      expect(mockClient.end).toHaveBeenCalledTimes(1);
    });
  });
  describe("Test create and delete MongoDB collection", () => {
    beforeEach(async () => {
      await startMongo;
    });
    afterEach(async () => {
      await closeMongo;
    });
    describe("Create MongoDB collection", () => {
      it("should create a collection for user", async () => {
        await createMongo("Jeff Bezos", { a: 1, b: 2, c: 3 });
        expect(mockClient.collection).toHaveBeenCalledTimes(1);
      });
      it("should delete a collection for a user", async () => {
        await createMongo("Jeff Bezos", { a: 1, b: 2, c: 3 });
        await deleteMongo("Jeff Bezos", { a: 1, b: 2, c: 3 });
        expect(mockClient.collection).toHaveBeenCalledTimes(2);
      });
    });
  });
});
