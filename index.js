const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
var cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
var jwt = require("jsonwebtoken");

// middleware
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
   const authHeaders = req.headers.authorization;
   if (!authHeaders) {
      return res.status(401).send({ message: "unauthorized access" });
   }
   jwt.verify(authHeaders, process.env.SECRET_TOKEN, function (err, decoded) {
      if (err) {
         return res.status(403).send({ message: "Forbidden Access" });
      }
      req.decoded = decoded;
      next();
   });
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kvgl9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
   useNewUrlParser: true,
   useUnifiedTopology: true,
   serverApi: ServerApiVersion.v1,
});
async function run() {
   try {
      await client.connect();
      const productCollection = client.db("warehouse").collection("products");

      app.get("/updateCheck", async (req, res) => {
         res.send("running warehouse management server from heroku");
      });

      app.get("/products", async (req, res) => {
         const query = {};
         const cursor = productCollection.find(query);
         const result = await cursor.toArray();
         res.send(result);
      });

      app.get("/items", async (req, res) => {
         const query = {};
         const cursor = productCollection.find(query);
         const result = await cursor.toArray();
         res.send(result);
      });

      app.get("/product/:_id", async (req, res) => {
         const id = ObjectId(req.params._id);
         const query = { _id: id };
         const result = await productCollection.findOne(query);
         res.send(result);
      });

      // updating Quantity
      app.put("/updateQuantity/:id", async (req, res) => {
         const { quantityNumber } = req.body;
         const filter = { _id: ObjectId(req.params.id) };
         const options = { upsert: true };
         const updateDoc = {
            $set: {
               quantity: quantityNumber - 1,
            },
         };
         const result = await productCollection.updateOne(
            filter,
            updateDoc,
            options
         );
         res.send(result);
      });

      // Restock Quantity
      app.put("/restockQuantity/:id", async (req, res) => {
         const { restockNumber } = req.body;
         console.log(restockNumber);
         const filter = { _id: ObjectId(req.params.id) };
         const options = { upsert: true };
         const updateDoc = {
            $set: {
               quantity: restockNumber,
            },
         };
         const result = await productCollection.updateOne(
            filter,
            updateDoc,
            options
         );
         res.send(result);
      });

      // deleting item
      app.delete("/product/:id", async (req, res) => {
         const query = { _id: ObjectId(req.params.id) };
         const cursor = await productCollection.deleteOne(query);
         res.send(cursor);
      });

      // insert item
      app.post("/insertItem", async (req, res) => {
         const item = req.body;
         const cursor = await productCollection.insertOne(item);
         res.send(cursor);
      });

      app.get("/myitems", verifyJWT, async (req, res) => {
         const decodedEmail = req.decoded.email;
         const user = req.query.user;
         if (decodedEmail === user) {
            const query = { userName: user };
            const cursor = productCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
         } else {
            res.status(403).send({ message: "forbidded access" });
         }
      });

      app.post("/getToken", async (req, res) => {
         const user = req.body;
         const token = jwt.sign(user, process.env.SECRET_TOKEN, {
            expiresIn: "1d",
         });
         res.send({ token });
      });
   } finally {
   }
}
run().catch(console.dir);

app.get("/", (req, res) => {
   res.send("Warehouse management");
});

app.listen(port, () => {
   console.log("Listening to port", port);
});
