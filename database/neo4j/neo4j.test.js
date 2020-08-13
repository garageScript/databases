const { startNeo4j, closeNeo4j } = require('./neo4j')
const neo4j = {}

//needed for startNeo4j
neo4j.driver = jest.fn().mockReturnValue({})

// driver and driver.close needed for closeNeo4j
const driver = neo4j.driver()
driver.close = jest.fn().mockReturnValue(Promise.resolve())

describe('Neo4j database', () => {
  /*
	startNeo4j initializes the `driver` variable with a value,
	so it must always be called before running any neo4j related tests.
	*/
  beforeEach(startNeo4j)

  test('Should resolve when closeNeo4j is called', async () => {
    const res = await closeNeo4j()
    expect(res).resolves
  })
})
