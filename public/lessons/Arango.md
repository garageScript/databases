# 1 Intro

Arango is an application that to stores your application data and allows you to search for them via queries. It can store data for you in such a way that retrieving data is efficient.

Arango is also a multi-model database, meaning it can store data in either tables or graphs!

# 2 Basics

To quickly help you get started, we will go over a few basic commands using [arangojs API](https://github.com/arangodb/arangojs) that you can follow along.

## 2.1 Connect

This section will show you how to start and close a connection to an Arango database.

```
const { Database } = require("arangojs");
let db;

// Run this function to connect to an Arango database!
const startArangoDB = () => {
  db = new Database({
  	url: 'https://arangodb.songz.dev/',
  	databaseName: '@username',
  	auth: {
  		username: '@username',
  		password: '@dbPassword',
  	},
	});
};

// Run this function to stop a connection to an Arango database!
const closeArangoDB = () => db.close();
```

## 2.2 Store and retrieve data

Arango's official website has a great [tutorial](https://www.arangodb.com/docs/stable/aql/tutorial-crud.html) on how to create, read, update, or delete data from an Arango database.
Arango has its own query language named `AQL`. Here is how you can run AQL commands:

To run AQL commands, use `` db.query(aql`commands go here`)``
Note that `db` in `db.query` comes from the startArangoDB function we used to connect to an Arango database.

Here is an example query of data.

```
const { aql } = require("arangojs");

const getPokemons = async () => {
	const pokemons = await db.query(aql`
		FOR c IN Characters
    	RETURN c
	`)
}
```

# 3 End

We are still learning about Arango. If you have interesting and helpful example or want to update this doc, please [let us know](https://github.com/garageScript/databases/issues)!
