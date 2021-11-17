const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const { MongoClient, ObjectId } = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_CLUSTER}.gmeoo.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.get('/', (req, res) => {
  res.send('Server Running Happily...');
});

async const run = () => {
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

        if(result) {
          res.json(result);
        }

        else {
          res.send([]);
        }
        
      });

      app.get('/products/featured', async (req, res) => {
        const pipeline = [ { $limit: 6 } ];

        const aggCursor = productCollection.aggregate(pipeline);
        const result = await aggCursor.toArray();

        if(result) {
          res.json(result);
        }
        else {
          res.send([]);
        }

      });

      app.get('/products/:id', async (req, res) => {
        const { id } = req.params;
        const query = { _id: ObjectId(id) };

        const matchedProduct = await productCollection.findOne(query);

        if(matchedProduct) {
          res.json(matchedProduct);
        }

        else {
          res.send({});
        }

      });

      app.post('/products', async (req, res) => {
        const insertDoc = req.body;

        const result = await productCollection.insertOne(insertDoc);
        res.json(result);
      });

      app.delete('/products/:id', async(req, res) => {
        const { id } = req.params;
        const query = { _id: ObjectId(id) };

        const result = await productCollection.deleteOne(query);
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
        
        if(matchedUser) {
          res.json(matchedUser);
        }

        else {
          res.send({});
        }

      });

      app.get('/orders', async (req, res) => {
        const query = {};
        const cursor = orderCollection.find(query);

        const orders = await cursor.toArray();
        
        if(orders) {
          res.json(orders);
        }

        else {
          res.send([]);
        }

      });

      app.get('/orders/:email', async (req, res) => {
          const { email } = req.params;
        const query = { email: email };
        
        const cursor = orderCollection.find(query);

        const orders = await cursor.toArray();

        if(orders) {
          res.json(orders);
        }

        else {
          res.send([]);
        }

      });

      app.put('/orders', async (req, res) => {
        const updated = req.body;

        const filter = { _id: ObjectId(updated._id) };

        let updateDoc = {};
        if(updated.isShipped)
        {
         updated.isShipped = false;
         updateDoc = {
             $set: {
                 isShipped: false
             },
         };
        }

        else {
            updated.isShipped = true;
            updateDoc = {
                $set: {
                    isShipped: true
                },
            };
           }
           const result = await orderCollection.updateOne(filter, updateDoc);
           res.json(updated);
      });

      app.delete('/orders/:id', async (req, res) => {
        const { id } = req.params;
        const query = { _id: ObjectId(id) };

        const result = await orderCollection.deleteOne(query);
        res.json(result);
      });

      app.post('/orders', async (req, res) => {
        const newOrder = req.body;
        const result = await orderCollection.insertOne(newOrder);
        res.json(result);
      });

      app.get('/reviews', async (req, res) => {
        const query = {};
        const cursor = reviewCollection.find(query);

        const reviews = await cursor.toArray();

        if(reviews) {
          res.json(reviews);
        }

        else {
          res.send([]);
        }

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
  };
  
  run().catch(console.dir);

app.listen(port, () => {
    console.log(`Listening on Port ${port}`);
});