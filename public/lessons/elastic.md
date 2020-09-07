
### Connect
Elasticsearch is accessible via API, which means you can connect to an Elasticsearch database by using the `fetch` function. You need to specify your credentials as well as where the Elasticsearch application is located(host). Check out the following examples.

<pre><code>// In this example, we use this example data.
// username: "my-username"
// password: "my-password"
// index: "my-index"

const buffer = Buffer.from("<u>my-username:my-password</u>").toString("base64")
const credential = "Basic " + buffer

fetch("<u>https://elastic.learndatabases.dev/my-index</u>", {
  headers: {
    Authorization: credential
  }
})
  .then(r => r.json())
  .then(console.log)
</code></pre>

* `my-username:my-password` is the username and password which is used to authenticate your requests.
* `https://elastic.learndatabases.dev/my-index` is the path that your `fetch` function will send requests to. The pattern is `host address/index name`.

In your case, the code should look like the example below.

<pre><code>const buffer = Buffer.from("<u>@username:@dbPassword</u>").toString("base64")
const credential = "Basic " + buffer

fetch("<u>https://elastic.learndatabases.dev/@username-example</u>", {
  headers: {
    Authorization: credential
  }
})
  .then(r => r.json())
  .then(console.log)
</code></pre>

This fetch request will query for general information about the index named `@username-example`. For security purposes, we only provide you with the authority to manipulate any indices whose name starts with `@username-`. So you can create, for example, indices named `@username-mails`, `@username-posts`, or etc. and write/read/analyze data at those indices.

### Get Data
Let's see how to get data from `@username-example` index.
```
const buffer = Buffer.from("@username:@dbPassword").toString("base64")
const credential = "Basic " + buffer

fetch("https://elastic.learndatabases.dev/@username-example/_search", {
  method: "POST",
  headers: {
    Authorization: credential,
    "content-type": "application/json"
  },
  body: JSON.stringify({
    query: {
      match_all: {}
    }
  })
})
  .then(r => r.json())
  .then(console.log)
```
This fetch request queries for data records that match the search query. Since we set query as `match_all: {}`, the Elasticsearch API will return a response containing all records that have an index value of `@username-example`. If you want to get records that match a specific `field: value` pattern, you can put it as an object in the `match_all` property. For more information, refer Elasticsearch's offical documentation [here](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-search.html). In the response, the actual data is stored in `.hits.hits` property as an array.

### Put data
To put data into an Elasticsearch database, send a "POST" request to `<host>/<index-name>/_doc`. Check out the following example.
```
const buffer = Buffer.from("@username:@dbPassword").toString("base64")
const credential = "Basic " + buffer

fetch("https://elastic.learndatabases.dev/@username-diary/_doc", {
  method: "POST",
  headers: {
    Authorization: credential,
    "content-type": "application/json"
  },
  body: JSON.stringify({
    date: "2020-09-05",
    subject: "My first data",
    message: "I just wrote some data to my Elasticsearch!"
    }
  })
})
  .then(r => r.json())
  .then(console.log)
```
This fetch request sends a command to save data into an Elasticsearch database index named @username-diary. If you want to save with different index name, you can just change the index name in the path to another one. For more information, refer Elasticsearch's offical documentation [here](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-index_.html).
