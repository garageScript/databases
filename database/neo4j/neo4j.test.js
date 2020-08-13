const { startNeo4j, closeNeo4j } = require('./neo4j')
const neo4j = require('neo4j-driver')

describe('Neo4j database', () => {
  //needed for startNeo4j
  neo4j.driver = jest.fn().mockReturnValue({})

  //needed for closeNeo4j
  const driver = neo4j.driver()

  beforeEach(startNeo4j)

  driver.close = jest.fn().mockReturnValue(Promise.resolve())

  test('Should resolve when closeNeo4j is called', async () => {
    const res = await closeNeo4j()
    expect(res).resolves
  })
})
