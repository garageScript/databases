const {startServer,stopServer}=require('../../src/server')
 const fetch = require('node-fetch')

 describe('test sign in page',()=>{
    const testPort = process.env.TEST_PORT || 20200
    const baseUrl = `http://localhost:${testPort}/signin`
    beforeAll(async ()=>{
         await startServer(testPort)
     })
     afterAll(async ()=>{
         await stopServer()
     })
     test('should render sign in page correctly', async()=>{
         const result = await fetch(baseUrl).then(r=> r.text())
         expect(result).toMatchSnapshot()
     })
 })
