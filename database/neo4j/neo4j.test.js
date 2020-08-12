let { closeNeo4j } = require('./neo4j')

describe('Neo4j database', () => {
	closeNeo4j = jest.fn().mockReturnValue(Promise.resolve())
	let driver.close = jest.fn().mockReturnValue(1)
  it('it should call end when closing neo4j', async () => {
    await closeNeo4j()
    expect(closeNeo4j).toHaveBeenCalledTimes(1)
  })
})
