const { Client } = require("pg");

const c = new Client({
  host: "freedomains.dev",
  port: 5432,
  user: "c0d3student",
  password: "practicegoodcommunicationskills",
  database: "js5"
});

c.connect().then(() => {
  createPgAccount("jelloxss", "mansxxs", "threxxadss");
});

const createPgAccount = (username, password, database) => {
  return c
    .query(`CREATE DATABASE ${database}`)
    .then(res => {
      console.log('created database', res);
      return c.query(
        `CREATE USER ${username} WITH ENCRYPTED password '${password}'`
      );
    })
    .then(res => {
      console.log("created role", res);
      return c.query(
        `GRANT ALL PRIVILEGES ON DATABASE ${database} To ${username}`
      );
    })
    .then(res => {
      console.log('privileges granted', res)
      return c.end();
    })
    .catch(err => {
      console.log("error", err);
    });
};
