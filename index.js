const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
var cors = require('cors')
const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors())
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kvgl9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect();
        const productCollection = client.db("warehouse").collection("products");


        app.get("/products", async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get("/items", async (req, res) => {
            const query = {};
            const cursor = productCollection.find({ name: { $in: ["ONION", "POTATO", "APPLE", "BANANA", "Rupchanda Soyabean Oil", "Mustard Oil"] } })
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get("/product/:_id", async (req, res) => {
            const id = ObjectId(req.params._id);
            const query = { _id: id };
            const result = await productCollection.findOne(query);
            res.send(result);
        })

    }
    finally {

    }
}
run().catch(console.dir);



app.get("/", (req, res) => {
    res.send("Warehouse management")
})

app.listen(port, () => {
    console.log("Listening to port", port)
})