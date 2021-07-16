
# Intro

In-memory database is a database which relies primarily on memory for data storage. 

Pros:
* Performance. RAM is way faster than any disks IOs

Cons:
* Data persistence can be tricky

Some datasets could be stored entirely in memory but most often in-memory databases are used as caches.  

# Apache Ignite

Ignite is an open source distributed in-memory database. It can be used as cache, data grid or key-value store. In our case we will use the latter.

Key-value store is the simplest data model, one unique key which is mapped to some value. With no schema limitations writes are very fast, but since database doesn't know anything about the value you can't use indexes to speed up searches. 

# Client

Ignite provides their own node.js client [apache-ignite-client](https://www.npmjs.com/package/apache-ignite-client). 

To connect to database:
```
const IgniteClient = require("apache-ignite-client");
const IgniteClientConfiguration = IgniteClient.IgniteClientConfiguration;

const igniteClientConfiguration = new IgniteClientConfiguration("host")
  .setUserName("username")
  .setPassword("password");
const connect = async () => {
  const igniteClient = new IgniteClient();
  await igniteClient.connect(igniteClientConfiguration);
};
connect();
```

To add values into cache you need to connect to cache, specify data type and its key:

```
const ObjectType = IgniteClient.ObjectType;
const basicOperations = async () => {
  const igniteClient = new IgniteClient();
  await igniteClient.connect(igniteClientConfiguration);
  console.log("successfully connected");
  const cache = (await igniteClient.getOrCreateCache("username")).setKeyType(
    ObjectType.PRIMITIVE_TYPE.INTEGER
  );
  await cache.put(1, "hello world");
  console.log(await cache.get(1));
  igniteClient.disconnect();
};
basicOperations();
```

You can find more examples [here](https://github.com/apache/ignite/tree/master/modules/platforms/nodejs/examples).

*Under construction* 