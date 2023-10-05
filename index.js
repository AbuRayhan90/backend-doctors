const express = require("express");
const app = express();
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.2okr69c.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const serviceCollection = client
      .db("doctors_portal")
      .collection("services");

    const bookingCollection = client
      .db("doctors_portal")
      .collection("bookings");

    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });

    // For Booking Service
    app.post("/booking", async (req, res) => {
      const booking = req.body;
      const query = {
        id: booking._id,
      };
      const exists = await bookingCollection.findOne(query);

      if (exists) {
        return res.send({ succsess: false, booking: exists });
      }
      {
        const result = await bookingCollection.insertOne(booking);
        return res.send({ succsess: true, result });
      }
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});
console.log(uri);
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
