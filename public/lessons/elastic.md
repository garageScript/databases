
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

This command requests general information about the index called `@username-example`. For the purpose of security, we only provide you with the authority to manipulate any indices whose name starts with `@username-`. So you can create indices called for example, `@username-mails` or `@username-posts` and write/read/analyze data.
