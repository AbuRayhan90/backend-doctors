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

    // For avialable services
    app.get("/available", async (req, res) => {
      const date = req.query.date;

      // step 1 : get all services
      const services = await serviceCollection.find().toArray();

      // step 2 : get all booking services
      const query = { date: date };
      const bookings = await bookingCollection.find(query).toArray();

      // step 3 : For each booking service find that booking service
      services.forEach((service) => {
        const serviceBooking = bookings.filter(
          (booking) => booking.treatmentName === service.name
        );
        const booked = serviceBooking.map((booked) => booked.slot);
        const avialable = service.slots.filter(
          (bookedSlot) => !booked.includes(bookedSlot)
        );
        service.slots = avialable;
      });
      res.send(services);
    });

    // For Booking Service
    app.post("/booking", async (req, res) => {
      const booking = req.body;
      const query = {
        treatmentId: booking.treatmentId,
        slot: booking.slot,
      };
      const exists = await bookingCollection.findOne(query);
      if (exists) {
        return res.send({ succsess: false, booking: exists });
      }
      const result = await bookingCollection.insertOne(booking);
      return res.send({ succsess: true, result });
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
