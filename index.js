const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const { MongoClient, ObjectId } = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_CLUSTER}.gmeoo.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


// func mongo
async function run() {
    try {
      await client.connect();

      const database = client.db(process.env.DB_NAME);

      const userCollection = database.collection(process.env.DB_COLLECTIONS_USER);
      const productCollection = database.collection(process.env.DB_COLLECTIONS_PRODUCT);
      const orderCollection = database.collection(process.env.DB_COLLECTIONS_ORDER);
      const reviewCollection = database.collection(process.env.DB_COLLECTIONS_REVIEW);

      const doc = {
        title: "Record of a Shriveled Datum",
        content: "No bytes, no problem. Just insert a document, in MongoDB",
      }
      const result = await userCollection.insertOne(doc);

    } finally {
    //   Ensures that the client will close when you finish/error
    //   await client.close();
    }
  }
  run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Server Running Happily...');
});

app.listen(port, () => {
    console.log(`Listening on Port ${port}`);
});