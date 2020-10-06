const fetch = require("node-fetch");

const sendFetch = (path, method, body, authorization) => {
  if (!path) return;
  const options = {
    method,
    headers: {
      "content-type": "application/json",
    },
  };
  body && (options.body = JSON.stringify(body));
  authorization && (options.headers.authorization = authorization);

  return fetch(path, options).then((r) => r.json())
};

module.exports = { sendFetch };
