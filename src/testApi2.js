const fetch = require('node-fetch')

fetch('http://localhost:3000/login', {
    method: "POST",
    headers: {
       'content-type': 'application/json'
    },
    body: JSON.stringify({
        username: '12345561212331478',
        password: 'abc12345',
        email: 'hel1125323123lo@google.com'
    })
}).then((r) => {
    return r.json()
}).then((r) => {
    console.log(r)
}).catch((err) => {
    console.log(err)
})