
### Connect
Elasticsearch is accessible via API, which means you can connect to your Elasticsearch databases by using the `fetch` function. You need to specify where the Elasticsearch application is located(host) and your credentials. Check out the following examples.

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

This command requests general information about the index called `@username-example`. For the purpose of security, we only provide you with the authority to manipulate any indices whose name starts with `@username-`. So you can create indices called for example, `@username-mails`, `@username-posts`, or etc. and write/read/analyze data.

### Get Data
At this point you should have only example index we just created for you. Let's see how to get data from `@username-example` index. Here's the request path patterns.
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
This command requests to send records data that matches the search query. Since we set query as `match_all: {}`, Elasticsearch will respond with all records that has index value with `@username-example`. If you want to get the records that matches specific `field: value` pattern, you can put it as an object in `match_all` property. For more information, refer Elasticsearch's offical documentation [here](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-search.html).
In the response, the actual data is stored in `.hits.hits` property as an array.

### Put data
To put data into Elasticsearch database, you can send "POST" request to `<host>/<index-name>/_doc`. Check out the following example.
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
This command sends request to Elasticsearch to save the data with index name of `@username-diary`. If you want to save with different index name, you can just change the index name in the path to another one. For more information, refer Elasticsearch's offical documentation [here](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-index_.html).
