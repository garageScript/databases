const fetch = require('node-fetch')
const session = require('express-session')
// fetch('http://localhost:3000/api/users', {
//     method: "POST",
//     headers: {
//         'content-type': 'application/json'
//     },
//     body: JSON.stringify({
//         username: '12345561212331478',
//         password: 'abc12345',
//         email: 'hel1125323123lo@google.com'
//     })
// }).then((r) => {
//     return r.json()
// }).then((r) => {
//     console.log(r)
// }).catch((err) => {
//     console.log(err)
// })

fetch('http://localhost:3000/api/users/26', {
    method: "DELETE"
}).then((r) => {
    return r.json()
}).then((r) => {
    console.log(r)
}).catch((err) => {
    console.log(err)
})