jest.mock("neo4j-driver");
const { startNeo4j, closeNeo4j } = require("./neo4j");
const neo4j = require("neo4j-driver");

// neo4j.driver needed for startNeo4j
neo4j.driver = jest.fn().mockReturnValue({
  close: jest.fn().mockReturnValue(Promise.resolve()),
});

// driver variable needed to do any commands related to neo4j
const driver = neo4j.driver();

describe("Neo4j database", () => {
  /*
	startNeo4j initializes the `driver` variable with a value,
	so it must always be called before running any neo4j related tests.
  */
  beforeEach(startNeo4j);

  test("Should call driver.close when closeNeo4j is called", async () => {
    await closeNeo4j();
    expect(driver.close).toHaveBeenCalledTimes(1);
  });
});
