const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// default request
app.get("/", (req, res) => {
  console.log("server running");
  res.send("Server running");
});

// mongodb configuration
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.3rmrc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// api function
async function run() {
  try {
    await client.connect();
    const database = client.db("warehouseManagement");
    const stockCollection = database.collection("stock");
    const blogCollection = database.collection("blog");
    console.log("Successfully connected to DB");

    // getting stock
    app.get("/stock", async (req, res) => {
      console.log('stock get hit');
      const limit = parseInt(req.query.limit);
      const email = req.query?.email;
      const intChecker = /^[0-9]+$/;
      let  query = {};

      if (email) {
        query = {email: email}
      }
      const cursor = stockCollection.find(query);
      let stock;
      if (intChecker.test(limit)) {
        stock = await cursor.limit(limit).toArray();
      } else {
        stock = await cursor.toArray();
      }
      res.send(stock);
    });

    // get bestSellingStock
    app.get('/stock/best-seller', async (req, res) => {
      const limit = parseInt(req.query.limit);
      const validLimit = /^[0-9]+$/.test(limit);
      
      const  query = {};
      const option = {
        sort: { sold: -1 },
      }
      const cursor = stockCollection.find(query, option);


      let bestSellingStock;
      if (validLimit) {
        bestSellingStock = await cursor.limit(limit).toArray();

      }else {
        bestSellingStock = await cursor.toArray();
      }
      res.send(bestSellingStock);
    } )

    // getting specific stock by id
    app.get('/stock/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: ObjectId(id)};

      const stock = await stockCollection.findOne(query);
      res.send(stock);
    })

    // creating a stock
    app.post("/stock", async (req, res) => {
      console.log('hited');
      const newStock = req.body.stockInfo;
      console.log(newStock);
      const { name, img, description, email, price, type, quantity, supplier_name, phone } =
        newStock;
      /* expecting data formate
        {
        name: "",
        email: "",
        type: "",
        img: "",
        supplier_name: "",
        price: [''],
        quantity: 0,
        phone: "",
        description: "",
        }
      */
      const doc = {
        name: `${name}`,
        email: `${email}`,
        img: `${img}`,
        description: `${description}`,
        sold: 0,
        type: `${type}`,
        price: price,
        quantity: quantity,
        supplier_name: `${supplier_name}`,
        phone: `${phone}`,
      };

      const result = await stockCollection.insertOne(doc);
      res.send(result)
      
    });

    // updating sold and quantity count
    app.put("/stock/:id", async (req, res) => {
      console.log('updating');
      const id = req.params.id;
      const newSoldCount = req.body.soldCount;
      const quantity = req.body.quantity;

      const filter = {_id: ObjectId(id)}
      const option = { upsert: true };

      if (newSoldCount || quantity) {
        const updateDock = {
          $set: {
            sold : newSoldCount,
            quantity: quantity,
          }
        }
        const result = await stockCollection.updateOne(filter, updateDock, option);
        res.send(result);
      }
      else {
        res.status(402).send({message: 'sold not found'})
      }
    })

    // deleting a stock
    app.delete('/stock/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const result = await stockCollection.deleteOne(query);
      res.send(result);
    })

    // getting blogs
    app.get('/blog', async (req, res) => {
      const query = {};
      const cursor = blogCollection.find(query);
      const blogs = await cursor.toArray();
      res.send(blogs);
    })

    // getting blog by id
    app.get('/blog/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: ObjectId(id)};

      const blog = await blogCollection.findOne(query);
      res.send(blog);
    })
    
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

// listening
app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
