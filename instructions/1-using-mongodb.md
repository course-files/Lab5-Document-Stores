# Tutorial on MongoDB

## 1. Create and Run a Docker Container for MongoDB

```shell
# Pull the image
docker pull mongodb/mongodb-community-server:latest

# Create and run the container
docker run --name mongodb -p 27017:27017 -d mongodb/mongodb-community-server:latest

# Alternatively:
docker run -d --name mongodb \
-e MONGO_INITDB_ROOT_USERNAME=student \
-e MONGO_INITDB_ROOT_PASSWORD=5trathm0re \
-p 27017:27017 \
-v ./container-volumes/mongodb/data-db:/data/db \
mongo:7.0
```

## 2. MongoDB Shell, MongoDB GUI, and Studio3T

* Download the MongoDB Shell from here: [https://www.mongodb.com/try/download/compass](https://www.mongodb.com/try/download/compass)

* Download the MongoDB GUI from here: [https://www.mongodb.com/try/download/compass](https://www.mongodb.com/try/download/compass)

* Download the Studio3T GUI from here: [https://studio3t.com/download/](https://studio3t.com/download/)

* Login to MongoDB via Docker on VS Code:

```shell
docker exec -it mongodb mongosh
```

## 3. Login to MongoDB

```javascript
use admin
db.auth("student", "5trathm0re")
```

To seek help in MongoDB:

```javascript
db.help()
db.collections.help()
```

## 4. Create a Database

You  do not have to define a schema upfront in MOngoDB; merely using it is enough.

```javascript
use mydb
```

Confirm which database you are connected to.

```shell
db
# or
show dbs

# Note: Show dbs does not show the created database because you need to
# insert data into the database first for it to exist.
```

## 5. Insert Data

We add new data in documents as JSON:

```javascript
db.towns.insert(
    {
        name: 'New York',
        population: 22200000,
        lastCensus: ISODate('2016-07-01T00:00:00.000Z'),
        famousFor: [ 'the MOMA', 'food', 'Derek Jeter' ],
        mayor: { name: 'Bill de Blasio', party: 'D' }
    }
)
```

Then show the existing databases

```shell
show dbs
```

The insertion also created a collection called `towns`.

```shell
show collections
```

## 6. Insert Data using a JavaScript Function

Create the function:

```javascript
function insertCity( name, population, lastCensus, famousFor, mayorInfo) {
    db.towns.insert({
        name: name,
        population: population,
        lastCensus: ISODate(lastCensus),
        famousFor: famousFor,
        mayor : mayorInfo
    });
}
```

Call the function:

```javascript
insertCity("Punxsutawney", 6200, '2016-01-31',
           ["Punxsutawney Phil"], { name : "Richard Alexander" }
)

insertCity("Portland", 582000, '2016-09-20',
          ["beer", "food", "Portlandia"], { name : "Ted Wheeler", party : "D" }
)
```

### 7. Retrieve Data

```shell
db.towns.find()

# or (documents with a specific value for a field)
db.towns.find({name : 'New York'})

# or (only a specific field in the document)
db.towns.find({name : 'New York'}, {famousFor : true})

# or (all fields in the document except)
db.towns.find({name : 'New York'}, {mayor : false})
```

We can also use Perl-Compatible Regular Expressions (PCRE). The following query finds all towns that begin with the letter 'P' and hav ea population that is less than 10,000. The result then contains only the `name` and the `population` fields.

```javascript
db.towns.find(
    { name : /^P/, population : { $lt : 10000 } },
    { _id: 0, name : 1, population : 1 }
)
```

Using "Greater Than or Equal To":

```javascript
db.towns.find(
    { lastCensus : { $gte : ISODate('2016-06-01') } },
    { _id : 0, name: 1 }
)
```

You can also construct operations as you would objects:

```javascript
var population_range = {
    $lt: 1000000,
    $gt: 10000
}

db.towns.find(
    { name : /^P/, population : population_range },
    { name: 1 }
)
```

You can search text by:

```javascript
// Matching exact values. Note 1 is equivalent to true.
db.towns.find(
    { famousFor : 'food' },
    { _id : 0, name : 1, famousFor : 1 }
)

// Matching partial values
db.towns.find(
    { famousFor : /MOMA/ },
    { _id : 0, name : 1, famousFor : 1 }
)

// Matching multiple values simultaneously
db.towns.find(
    { famousFor : { $all : ['food', 'beer'] } },
    { _id : 0, name:1, famousFor:1 }
)

// Not matching any value
db.towns.find(
    { famousFor : { $nin : ['food', 'beer'] } },
    { _id : 0, name : 1, famousFor : 1 }
)
```

## 8. Retrieve Data from Deeply Nested Sub-Documents

Retrieve towns with mayors from the Democratic Party.

```javascript
db.towns.find(
    { 'mayor.party' : 'D' },
    { _id : 0, name : 1, mayor : 1 }
)
```

Retrieve towns with mayors who are not members of any party.

```javascript
db.towns.find(
    { 'mayor.party' : { $exists : false } },
    { _id : 0, name : 1, mayor : 1 }
)
```

## 9. Retrieve Results of Deeply Nested Sub-Documents using the `$elemMatch` Directive

Insert data into a new collection called `countries`:

```javascript
db.countries.insert({
    _id : "us",
    name : "United States",
    exports : {
        foods : [
            { name : "bacon", tasty : true },
            { name : "burgers" }
        ]
    }
})

db.countries.insert({
    _id : "ca",
    name : "Canada",
    exports : {
        foods : [
            { name : "bacon", tasty : false },
            { name : "syrup", tasty : true }
        ]
    }
})

db.countries.insert({
    _id : "mx",
    name : "Mexico",
    exports : {
        foods : [{
            name : "salsa",
            tasty : true,
            condiment : true
        }]
    }
})
```

We can confirm the insertions by counting the number of documents in the collection:

```javascript
db.countries.countDocuments()
```

Matching multiple values in a sub-document:

```javascript
db.countries.find({
    'exports.foods' : {
        $elemMatch : {
            name : 'bacon',
            tasty : true
        }
    }
    },
    { _id : 0, name : 1 }
)
```

```javascript
db.countries.find({
    'exports.foods' : {
        $elemMatch : {
            tasty : true,
            condiment : { $exists : true }
        }
    }
    },
    { _id : 0, name : 1 }
)
```

## 10. Retrieve Results using MongoDB Operators

The `$or` Operator

```shell
db.countries.find({
    $or : [
        { _id : "mx" },
        { name : "United States" }
    ]
    },
    { _id:1 }
)
```

## 11. Updating Data in MongoDB

You must use the `$set` declarative when updating documents.

```javascript
db.towns.find()

db.towns.updateOne(
    { name : 'Portland' },
    { $set : { state : 'OR' } }
);
```

An alternative for numeric values is `$inc`. E.g.:

```javascript
db.towns.update(
    { name : 'Portland' },
    { $inc : { population : 555} }
)
```

## 12. Referential Integrity in MongoDB

Referential integrity ensures that relationships between documents in different collections remain consistent. In relational databases, foreign keys enforce this, but MongoDB (a non-relational or NoSQL database) does not natively support foreign key constraints. Instead, referential integrity must be implemented programmatically.

Performing joins of referenced relations/documents in a distributed database is inefficient. Therefore, embedding is the preferred approach for non-relational distributed databases because all the data is in one place.

### A. Example of embedding (Denormalization)

```javascript
{
  "_id": "user_123",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "posts": [
    {
      "post_id": "post_001",
      "title": "My First Post",
      "content": "This is my first blog post."
    },
    {
      "post_id": "post_002",
      "title": "Another Day",
      "content": "Here is what happened today..."
    }
  ]
}
```

Code to create the collection:

```javascript
use blogDatabase_denormalized;

// Create the "users" collection and insert a user with embedded posts
db.users.insertOne({
  _id: "user_123",
  name: "John Doe",
  email: "john.doe@example.com",
  posts: [
    {
      post_id: "post_001",
      title: "My First Post",
      content: "This is my first blog post."
    },
    {
      post_id: "post_002",
      title: "Another Day",
      content: "Here is what happened today..."
    }
  ]
});

// Verify the data
db.users.find().pretty();
```

### B. Example of Referencing (Normalization)

User Collection:

```javascript
{
  "_id": "user_123",
  "name": "John Doe",
  "email": "john.doe@example.com"
}
```

Posts Collection:

```javascript
{
  "_id": "post_001",
  "user_id": "user_123",
  "title": "My First Post",
  "content": "This is my first blog post."
}
```

Code to create the `users` collection:

```javascript
use blogDatabase_normalized;

db.users.insertOne({
  _id: "user_123",
  name: "John Doe",
  email: "john.doe@example.com"
});

// Verify the data
db.users.find().pretty();

// Create the "posts" collection and insert posts
db.posts.insertMany([
  {
    _id: "post_001",
    user_id: "user_123", // Reference to the user
    title: "My First Post",
    content: "This is my first blog post."
  },
  {
    _id: "post_002",
    user_id: "user_123", // Reference to the user
    title: "Another Day",
    content: "Here is what happened today..."
  }
]);

// Verify the data
db.posts.find().pretty();
```

The user_id in the posts collection acts like a foreign key, referencing the _id in the users collection.

### C. Retrieve Data using Referencing

```javascript
// Fetch user and their posts
const user = db.users.findOne({ _id: "user_123" });
const posts = db.posts.find({ user_id: "user_123" }).toArray();

console.log({ user, posts });
```

### D. Cascade Delete Data

```javascript
// Delete user and their posts
db.users.deleteOne({ _id: "user_123" });
db.posts.deleteMany({ user_id: "user_123" });
```

## 13. Deleting Documents

Replace `find()` with `remove()`. You can also be more specific as shown below.

```javascript
use mydb

var badBacon = {
    'exports.foods' : {
    $elemMatch : { name : 'bacon', tasty : false
    }
    }
}

db.countries.find(badBacon)

db.countries.deleteOne(badBacon)
```

## 14. Indexing

MongoDB provides several of the best data structures for indexing, such as the classic B-Tree as well as other additions, such as 2D indexes and spherical GeoSpatial indexes.

```javascript
syntheticMobileNumbers(720, 123000, 223000)

// Delete a whole collection
db.phones.drop()  

// Delete a function
db.system.js.remove({ _id: "syntheticMobileNumbers" })

//List all functions
use mydb

// List all functions stored in the system.js collection
db.system.js.find().pretty()
```

### A. View All Indexes

```javascript
db.getCollectionNames().forEach(function(collection) {
    print("Indexes for the " + collection + " collection:"); printjson(db[collection].getIndexes());
});
```

### B. Measure the Performance without an Index

```javascript
db.phones.find({display: "+261 720-123019"})
db.phones.find({display: "+261 720-123019"}).explain("executionStats").executionStats
```

### C. Create an Index

Indexes simply “cost” more in Mongo than in a relational database like Postgres due to Mongo’s schemaless nature. You should always consider these impacts when building an index by creating indexes at off-peak times, running index creation in the background, and running them manually rather than using automated index creation.

The following creates an index on the field called `display`. The index options are that it should be unique and that it should drop duplicates. The last index option specifies that it should be created in the background while other processes are being executed.

```javascript
 db.phones.ensureIndex(
    { display : 1 },
    { unique : true, dropDups : true, background : 1 }
)

// Confirm the existence of the index
db.phones.getIndexes()
```

### D. Measure the Performance with an Index

Notice the number of scanned objects specified in `totalDocsExamined`:

```javascript
db.phones.find({display: "+261 720-123019"}).explain("executionStats").executionStats
```

### E. Measure Performance using the System Profiler

```javascript
db.setProfilingLevel(2)
db.phones.find({display: "+261 720-123019"})

db.system.profile.find()
db.system.profile.find()[0].execStats
```

## 15. MapReduce in MongoDB

Mapreduce operations are designed for performing computations over large datasets. Every mapreduce operation is split into two basic steps. First, a map step performs some series of filtering and/or sorting operation, winnowing the original dataset down into some subset. Then, a reduce step performs some kind of operation on that subset. An example mapreduce operation would be finding all baseball players in Major League history with the first name Dave (the map step) and then finding the cumulative batting average for all of those Daves (the reduce step).

In MongoDB, the map step involves creating a mapper function that calls an emit() function. The benefit of this approach is you can emit more than once per document. The reduce() function accepts a single key and a list of values that were emitted to that key. Finally, Mongo provides an optional third step called finalize(), which is executed only once per mapped value after the reducers are run. This allows you to perform any final calculations or cleanup you may need.

Let’s generate a report that counts all phone numbers that contain the same digits for each country. First, we’ll store a helper function that extracts an array of all distinct numbers.

Once you create the following functions: `distinctDigits()` (the helper function), `map()`, and `reduce()`, execute the following to save the helper function in MongoDB:

```javascript
db.system.js.insertOne({_id: 'distinctDigits', value: distinctDigits})
```

Then execute the following to run the MapReduce job:

```javascript
results = db.runCommand({
    mapReduce: 'phones',
    map: map,
    reduce: reduce,
    out: 'phones.report'
})
```

Lastly, execute the following to output the results:

```javascript
db.phones.report.find({'_id.country' : 254})
```
