const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;


const app = express();


// middleware
app.use(cors());
app.use(express.json());


// default request
app.get('/', (req, res) => {
  console.log('server running');
  res.send('Server running')
})

// mongodb configuration
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.3rmrc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


// api function
async function run () {

  try {
    await client.connect();
    const database = client.db('warehouseManagement');
    const stockCollection = database.collection('stock');
    console.log('Successfully connected to DB');

    // getting stock
    app.get('/stock', async (req, res) => {
      const limit = parseInt(req.query.limit);
      const intChecker = /^[0-9]+$/;

      const query = {};
      const cursor = stockCollection.find(query);
      let stock;

      if (intChecker.test(limit)) {
        stock = await cursor.limit(limit).toArray();
      }
      else {
        stock =  await cursor.toArray();
      }
      res.send(stock);
    })
  }
  finally {
    // await client.close();
  }
}
run().catch(console.dir);

client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});


// listening
app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
})
"initialized"