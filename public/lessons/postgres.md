# 1 Intro
Postgres is an application. More specifically, a database application for you to organize your data. It can store data for you and you can have multiple apps connect to your Postgres:

<div style="background-color: white; text-align: center"><img src="https://mermaid.ink/img/eyJjb2RlIjoiZ3JhcGggTFJcblx0RFtBcHAxXSAtLT4gUG9zdGdyZXNcblx0RVtBcHAyXS0tPiBQb3N0Z3JlcyBcblx0RltBcHAzXSAtLT4gUG9zdGdyZXMiLCJtZXJtYWlkIjp7InRoZW1lIjoiZGVmYXVsdCJ9LCJ1cGRhdGVFZGl0b3IiOmZhbHNlfQ" alt="multiple apps connecting to postgres"></div>

# 2 Basics
To quickly help you get started, we will go over a few basic commands that you can follow along. Explanations and best practices will be covered in the section below.

## 2.1 Connect
To connect to your app to Postgres, you need a module called `pg`. You need to specify where the postgres application is located (host and port), the name of your database, and your username / password to login to the database.

```
const { Client } = require('pg')

const startApp = async () => {
  client = new Client({
    host: 'learndatabases.dev',
    port: 5432,
    user: '@username',
    password: '@dbPassword',
    database: '@username'
  })
  await client.connect()
  console.log('Connected')
}

startApp()
```

## 2.2 Simple Commands
  After connecting to Postgres, you can now send commands that Postgres can understand. These commands are called Sequel Query Language (SQL). Here are a few:

  * `CREATE TABLE lesson( id serial PRIMARY KEY, title VARCHAR (256) );`
    * This creates a table called `lesson` that has 2 columns: `id` and `title`
    * `id` column is a primary key and the `serial` property means that it will automatically increase as you add rows into the table.
    * `VARCHAR (256)` means that title is a string of up to 256 characters.
    * **Make sure you don't run this over and over again. You only need to run this command once**
  * `INSERT INTO lesson (title) VALUES ('postgres tutorial')`
    * This creates a new row in the `lesson` table with a title of 'postgres tutorial'.
  * `select * from lesson where title = 'postgres tutorial'` 
    * This retrieves all the rows from the lesson table that has the title `"postgres tutorial'`.
  * `UPDATE lesson SET title = 'postgres demo' WHERE id=1;`
    * Retrieves the row where `id =1`, and then changes the title to `'postgres demo'`
  * `DELETE FROM lesson WHERE id=1;`
    * Deletes the row where `id = 1`

  To run a Query, you run `client.query(' -- YOUR SQL HERE --')`

  **Make sure you await to resolve!** All SQL commands involves sending a the SQL to your postgres application and then waiting for it to finish executing, so the commands will be asynchronous. Therefore any client actions will be asynchronous and returns a promise. To wait for a command to finish, you need an `await` or `.then` to wait for the query to resolve before continuing.

```
const lessons = await client.query('SELECT * from lesson;'); // gets all the lessons
console.log( lessons.rows )
```

## 2.3 Usage in your website
  How would you execute these commands in your website? Here are a few sample code to build an API:

```
app.post('/api/lessons', async (req, res) => {
  await client.query(`INSERT INTO lesson (title) VALUES ($1)`, [req.body.title])
  res.status(201).send('lesson created')
})

app.get('/api/lessons', async (req, res) => {
  const lessons = await client.query(`select * from lesson;`)
  res.json(lessons.rows)
})

app.get('/api/lessons/:id', async (req, res) => {
  const lessons = await client.query(`select * from lesson WHERE id=$1;`, [req.params.id])
  res.json(lessons.rows[0])
})

app.put('/api/lessons/:id', async (req, res) => {
  const lessons = await client.query(`UPDATE lesson SET title = $1 WHERE id=$2;`, [req.body.title, req.params.id])
  res.send('resource updated')
})

app.delete('/api/lessons/:id', async (req, res) => {
  await client.query(`DELETE lesson WHERE id=$1;`, [req.params.id])
  res.send('resource deleted')
})
```

### 2.3.1 Security
Notice how we don't create a string from user input and directly execute that query like this:

```
client.query(`DELETE lesson WHERE id=${req.params.id};`)
```

If you create an SQL query directly from user input, your database will have a security issue called (**Injection vulnerability**). A user could simply pass in the following as id: `1; UPDATE lesson SET title="my awesome title" WHERE id=1`. The user could essentially do anything they want to your database, including deleting all your data. 

To prevent this awful attack, always make sure to pass user input as the second argument into `client.query`. The `client.query` function will help you clean the user input to prevent sql injection attacks.

# 3 Database Design
When it comes to Postgres and other SQL databases, you must be very intentional about your data and make sure it is clear and organized. If you are building a website like [c0d3](https://www.c0d3.com) and you have a `user` table to store user information and a `lesson` table to store lesson information (like title and description), how do you store the user's progress for each lesson? 

**Option1** Could you add a column to the `user` table? 
* No. Imagine someone suggested this to you. Knowing what you know so far, explain why it does not make sense to add a column to the `user` table.

**Option2** Could you add a column to the `lesson` table? 
* No. Imagine someone suggested this to you. Knowing what you know so far, explain why it does not make sense to add a column to the `lesson` table.

Creating a new table. The best solution is to create a new table called `userlesson` that has 3 columns:
* `userId` to retrieve user's information from the corresponding `user` table when needed.
* `lessonId` to retrieve lesson's information from the corresponding `lesson` table when needed.
* `status` that is a string, to store the user's status for the each lesson.

In the above example, since `userId` and `lessonId` are used to retrieve the row from the user and lesson tables respectively, they are called **foreign keys**. `userId` is a **foreign key** to the `user` table.

The `id` column in the `user` and `lesson` table that other tables reference to, is called the **primary key**. `id` column is a **primary key** for the lesson (or user) table.

Let's say you want to see what the status is for lesson with id 5 for every user in your database. How would you do that?

**Option 1** : Get all the users from your database and then get their lesson status for each user:

```
const users =  await client.query(`select * from user;`)
const allStatuses = await Promise.all( users.rows.map( (user) => {
  return client.query(`select * from userlesson WHERE userid=$1 AND lessonid=$2;`, [user.id, lessonId])
}))
```

**Option 2**: Run 1 query using **join**:

```
const result = client.query(`
  SELECT
    userlesson.status,
    user.email,
  FROM
    userlesson
  WHERE 
    userlesson.lessonid = $1
  INNER JOIN user ON user.id = userlesson.userid
`, [lessonId])
```

## 3.1 Joins
**Join** helps you combine these tables together and get data from all the tables in 1 query. If you forget how to use **Join**, remember that you can always use option 1 to get the data you need by running multiple queries. To understand why you need **join**, let's analyze the two options above. Let's say:

* You have 1000 users
* Each user took 7 lessons. So your `userlesson` table has 7000 rows.

**Option1**: 1000*7000 lookups. 7 Million lookups!
* Getting all the users, 1000 rows.
* For each user
   * Look through 7000 rows in the `userlesson` table to find the correct `userid` and `lessonid`

**Option2**: 7000 lookup + magic time
* Get all the userlesson where lessonid matches. 7000 lookups
* Combine the result table with user table (magic time).

Postgres's magic time is really fast. Option 2 will be significantly faster than option 1 and with a big database it could mean the difference between waiting months and waiting minutes. If you are a **data analyst**, part of your job is to figure out how to join tables efficiently to get the data you need quickly.

Sometimes, you could unknowingly join tables in a way to make your query ALOT slower than option 1. The most painful part about this mistake is that when data is small, you don't notice the query taking a long time. However, as the company grows over the years and more data is accumulated, the code is forgotten and the application becomes really, really slow. This problem is very difficult to fix and to avoid writing **joins** directly, most companies use an Object Relational Mapping (ORM) library to generate the SQL queries for you. This not only avoids the problem of engineers joining the tables incorrectly but also allows developers to use the database without knowing SQL.

# 4 ORM
   In the previous section, you learned how to directly connect to your postgres database, execute simple queries, and execute more complex queries using **join**. These SQL queries are hard to remember, manage, and could be written incorrectly to make the queries really slow. To solve these problems, most production systems use an Object Relational Mapping (ORM)  library. We will use the most common one called [sequelize](https://sequelize.org/master/manual/getting-started.html) in this section. Sequelize converts your JavaScript functions into SQL commands for you. 

## 4.1 Connection and models

   To use sequelize, you must first connect to your database and then create the necessary tables.

```
const { Sequelize, DataTypes } = require('sequelize')
// Defining your database connection
const sequelize = new Sequelize('database', 'username', 'password', {
  host: '<host for database>',
  dialect: 'postgres'
});

// Creating a table called lesson
const Lesson = await sequelize.define('lesson', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  }
})
await sequelize.sync({ alter: !!process.env.ALTER_DB })
await sequelize.authenticate()

// Update title
await Lessons.update({
  title: "new value"
  }, {
  where: { id: 1 }
})

await Lessons.destroy( {
  where: { id: 1 }
})

await Lessons.findAll()

await Lessons.findAll( {
  where: { id: 1 }
})

await Lessons.create({
  title: 'new title'
})
```
