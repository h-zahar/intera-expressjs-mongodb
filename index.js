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

      app.get('/products', async (req, res) => {
        const query = {};
        const cursor = productCollection.find(query);

        const result = await cursor.toArray();
        res.json(result);
      });

      app.get('/products/featured', async (req, res) => {
        const pipeline = [ { $limit: 6 } ];

        const aggCursor = productCollection.aggregate(pipeline);
        const result = await aggCursor.toArray();

        res.json(result);
      });

      app.post('/products', async (req, res) => {
        const insertDoc = req.body;

        const result = await productCollection.insertOne(insertDoc);
        res.json(result);
      });

      app.delete('/products/:id', async(req, res) => {
        const { id } = req.params;
        console.log(id);
        const query = { _id: ObjectId(id) };

        const result = await productCollection.deleteOne(query);
        console.log(result);
        res.json(result);
      });

      app.post('/users', async (req, res) => {
        const newUser = req.body;
        const result = await userCollection.insertOne(newUser);
        res.json(result);
      });

      app.put('/users', async (req, res) => {
        const newUser = req.body;
        const filter = {email: newUser.email};
        const option = {upsert: true};

        const upsertedDoc = {
            $set: newUser
        };
        
        const result = await userCollection.updateOne(filter, upsertedDoc, option);
        res.json(result);
      });

      app.put('/users/:email', async (req, res) => {
        const { email } = req.params;
        const filter = { email: email };
        const replacedDoc = {
            $set: { isAdmin: true }
        };

        const result = await userCollection.updateOne(filter, replacedDoc);
        res.json(result);
      });

      app.get('/users/:email', async (req, res) => {
        const { email } = req.params;
        const query = { email: email };

        const matchedUser = await userCollection.findOne(query);
        
        res.json(matchedUser);
      });

      app.get('/reviews', async (req, res) => {
        const query = {};
        const cursor = reviewCollection.find(query);

        const reviews = await cursor.toArray();
        res.json(reviews);
      });

      app.post('/reviews', async(req, res) => {
        const newReview = req.body;
        const result = await reviewCollection.insertOne(newReview);
        res.json(result);
      });

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