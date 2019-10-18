const express = require('express');
const app = express();
const port = 3000;
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const url = 'mongodb://localhost:27017';
const dbName = "test-inventory";
const client = new MongoClient(url, {useNewUrlParser: true, useUnifiedTopology: true});
const Item = require('./db-model.js');

const dbInsertion = async function (data) {
        try {
            await client.connect();
            const db = client.db(dbName);
            let r = await db.collection('test').insertOne(data);
            assert.equal(1, r.insertedCount);
        } catch(err) {
            console.log(err.stack);
        }
    };

const dbConsult = async function () {
    try {
        await client.connect();
        const db = client.db(dbName);
        db.collection('test').find({}).toArray(function (error, documents) {
            assert.equal(null, error);
            console.log(documents);
        });
    } catch(err) {
        console.log(err.stack);
    }
};

app.get('/', function(req, res) {
    client.connect().then(
        (instance) => {
            let db = instance.db(dbName)
            return db.collection('test').find({})
        }
    ).then(
        (cursor) => {
            cursor.toArray((error, documents) => {
                assert.equal(null, error)
                res.send(documents)
            })
        }
    ).catch((err => console.log(err.message)));
});

app.get('/inventory', function(req, res) {
    (async function () {
        try {
            await client.connect();
            const db = client.db(dbName);
            db.collection('test').find({}).toArray(function (error, documents) {
                assert.equal(null, error);
                res.send(documents);
            });
        } catch(err) {
            console.log(err.stack);
        }
    })();
});

app.post('/update/quantity/:title.:amount', function(req, res) {
    let incAmount = 1;
    let newAmount = 0;
    if(req.params.amount)
        newAmount = Number.parseInt(req.params.amount);
    if(!isNaN(newAmount)) 
        incAmount = newAmount;
    (async function (itemTitle) {
        try {
            await client.connect();
            const db = client.db(dbName);
            let r = await db.collection('test').updateOne({title: itemTitle}, {$inc: {quantity: incAmount}});
            assert.equal(1, r.matchedCount);
            assert.equal(1, r.modifiedCount);
            res.send(JSON.parse("{ \"message\": \"document updated\" }"));
        } catch(err) {
            console.log(err.stack);
            res.send(JSON.parse("{ \"message\": \"error updating document\" }"));
        }
    })(req.params.title);
});

app.post('/addItem/:title-:description-:quantity-:existence-:imageFile', function(req, res) {
    let newData = req.params;
    newData.existence === "true" ? newData.existence = true : newData.existence = false;
    newData.quantity = Number.parseInt(newData.quantity);
    let newItem = new Item(newData.title, newData.description,
        newData.quantity, newData.existence, newData.imageFile);
    dbInsertion(newItem);
    res.send(newItem);
});

app.listen(port, () => console.log(`Server ready at port ${port}`));

process.on('exit', function() {
    console.log("Closing connections");
    client.close();
});