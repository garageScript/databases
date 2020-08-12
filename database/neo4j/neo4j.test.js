let { closeNeo4j } = require('./neo4j')

describe('Neo4j database', () => {
  closeNeo4j = jest.fn().mockReturnValue(1)
  it('it should call end when closing neo4j', async () => {
    const res = await closeNeo4j()
    expect(res).toEqual(1)
  })
})
