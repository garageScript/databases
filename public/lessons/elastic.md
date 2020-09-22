# 1 Intro
Elasticsearch is an application that to stores your application data and allows you to search for them via queries. It can store data for you and you can have multiple apps connect to your Elasticsearch application:

<div style="background-color: white; text-align: center"><img src="https://mermaid.ink/img/eyJjb2RlIjoiZ3JhcGggTFJcblx0RFtBcHAxXSAtLT4gUG9zdGdyZXNcblx0RVtBcHAyXS0tPiBQb3N0Z3JlcyBcblx0RltBcHAzXSAtLT4gUG9zdGdyZXMiLCJtZXJtYWlkIjp7InRoZW1lIjoiZGVmYXVsdCJ9LCJ1cGRhdGVFZGl0b3IiOmZhbHNlfQ" alt="multiple apps connecting to postgres"></div>

When Elasticsearch runs, it starts up a server that you can interact with by sending HTTP requests. Unlike other databases, you don't have to learn a new language because you can just send HTTP requests. As a result, there is no need to connect to the Elasticsearch database. You simply send a http request when you need to store or retrieve data. 

**Keywords**
* **Index** - Think of this as a table name. For security purposes, we only provide you with the authority to manipulate any indices whose name starts with `@username-`. So you can create, for example, indices named `@username-mails`, `@username-posts`, or etc. and write/read/analyze data at those indices.

The following examples below will be using index named `@username-example`. 

# 2 Basics
This section will show you how to store and retrieve data from your elastic search database.

## 2.1 Create / Update / Delete data
To put data into an Elasticsearch database, send a "POST" request to `https://elastic.learndatabases.dev/@username-example/_doc`. Check out the following example.

```
const fetch = require('node-fetch')
const credential = Buffer.from("@username:@dbPassword").toString("base64")

fetch("https://elastic.learndatabases.dev/@username-example/_doc", {
  method: "POST",
  headers: {
    Authorization: `Basic ${credential}`,
    "content-type": "application/json"
  },
  body: JSON.stringify({
    date: "2020-09-05",
    subject: "My first data",
    message: "I just wrote some data to my Elasticsearch!"
    user: {
      id: 5
    }
  })
}).then(r => r.json()).then(console.log)
```

Notice how we are sending a `Basic Authorization` Header with our username and password in our database request. When we get a response, we are turning the response into a JSON object and then printing the result into the console. You will get a documentid for the entry you created. 

To delete the entry, you can send a delete request. Make sure to replace `documentId` with the documentId of the record you created with the previous request:

```
const fetch = require('node-fetch')
const credential = Buffer.from("@username:@dbPassword").toString("base64")

fetch("https://elastic.learndatabases.dev/@username-example/_doc/documentId", {
  method: "DELETE",
  headers: {
    Authorization: `Basic ${credential}`,
    "content-type": "application/json"
  }
}).then(r => r.json()).then(console.log)
```

To update the entry, you can send a `PUT` request. Make sure to replace `documentId` with the documentId of the record you created with the previous request. In the following example we will change the subject name:

```
const fetch = require('node-fetch')
const credential = Buffer.from("@username:@dbPassword").toString("base64")

fetch("https://elastic.learndatabases.dev/@username-example/_doc/documentId", {
  method: "PUT",
  headers: {
    Authorization: `Basic ${credential}`,
    "content-type": "application/json"
  },
  body: JSON.stringify({
    subject: "My second data"
  })
}).then(r => r.json()).then(console.log)
```

## 2.2 Search data
Now that you know how to store data, let's search for some data in our database!

```
const fetch = require('node-fetch')
const credential = Buffer.from("@username:@dbPassword").toString("base64")

fetch("https://elastic.learndatabases.dev/@username-example/_doc", {
  method: "POST",
  headers: {
    Authorization: `Basic ${credential}`,
    "content-type": "application/json"
  },
  body: JSON.stringify({
    query: {
      match_all: {}
    }
  })
}).then(r => r.json()).then(console.log)
```

Notice how our http request body has a `query` property. This tell Elasticsearch that we are doing a search. `match_all: {}` means we want all matches. To specifically find an entry with the subject `"My first data"`, you can send a query body like the following:

```
  body: JSON.stringify({
    query: {
      match: {
        "subject": "My first data"
      }
    }
  })
```

To find data with userid of 5:

```
  body: JSON.stringify({
    query: {
      match: {
        "user.id": 5
      }
    }
  })
```

## 2.3 Usage in your website
How would you execute these commands in your website? Here are a few sample code to build a REST API using the express library:

```
const fetch = require('node-fetch')
const credential = Buffer.from("@username:@dbPassword").toString("base64")

const sendQuery = (method, body, docId='') => {
  const options = {
    method,
    headers: {
      Authorization: `Basic ${credential}`,
      "content-type": "application/json"
    }
  }
  if (body) {
    options.body = JSON.stringify(body)
  } 
  return fetch(`https://elastic.learndatabases.dev/@username-example/_doc/${docId}`, options)
    .then(r => r.json())
}

app.post('/api/lessons', async (req, res) => {
  await sendQuery('POST', req.body)
  res.status(201).send('lesson created')
})

app.get('/api/lessons', async (req, res) => {
  const lessons = await sendQuery('POST', {
    query: {
      match: {
        "user.id": 5
      }
    }
  })
  res.json(lessons.hits)
})

app.get('/api/lessons/:id', async (req, res) => {
  const lessons = await sendQuery('POST', {
    query: {
      match: {
        "_doc.id": req.params.id
      }
    }
  })
  res.json(lessons.hits[0])
})

app.put('/api/lessons/:id', async (req, res) => {
  await sendQuery('PUT', req.body, req.params.id)
  res.send('resource updated')
})

app.delete('/api/lessons/:id', async (req, res) => {
  await sendQuery('DELETE', false, req.params.id)
  res.send('resource deleted')
})
```

### 2.3.1 Security
Make sure to escape user input! In the examples above we are directly sending the user query into elastic search. This opens up a security flow where users may do malicious things like delete other people's data. Make sure you look at user input and don't directly put user input into your elastic search query!

# 3 End
We are still learning about Elasticsearch. If you have interesting and helpful example or want to update this doc, please [let us know](https://github.com/garageScript/databases/issues)!
