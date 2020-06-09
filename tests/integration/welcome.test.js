const {startServer,stopServer}=require('../../src/server')
const fetch = require('node-fetch')

describe('test welcome page',()=>{
    beforeAll(async ()=>{
        await startServer(20200)
    })
    afterAll(async ()=>{
        await stopServer()
    })
    test('should render welcome page correctly', async()=>{
        const result = await fetch('http://127.0.0.1:20200/').then(r=> r.text())
        expect(result).toMatchSnapshot()
    })
})
