const {startServer,stopServer}=require('../../src/server')
 const fetch = require('node-fetch')

 describe('test welcome page',()=>{
    const testPort = process.env.TEST_PORT || 20200
    const baseUrl = `http://localhost:${testPort}/`
    beforeAll(async ()=>{
         await startServer(testPort)
     })
     afterAll(async ()=>{
         await stopServer()
     })
     test('should render welcome page correctly', async()=>{
         const result = await fetch(baseUrl).then(r=> r.text())
         expect(result).toMatchSnapshot()
     })
 })
