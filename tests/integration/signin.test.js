const {startServer,stopServer}=require('../../src/server')
const fetch = require('node-fetch')

describe('test welcome page', () => {
const testPort = process.env.TEST_PORT || 20200
const testUrl = `http://localhost:${testPort}/signin`
beforeAll(async ()=>{
        await startServer(testPort)
    })
    afterAll(async ()=>{
        await stopServer()
    })
    test('should render signin page correctly', async () => {
        const result = await fetch(testUrl).then(r => r.text())
        expect(result).toMatchSnapshot()
    })
})
