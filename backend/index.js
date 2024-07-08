const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const crypto = require("crypto");
require("dotenv").config();
const connectDB = require('./connectDB');
// const paymentRoute = require('./routes/paymentRoutes.js')

const EventRouter = require('./routes/EventsRoutes.js');
const OrganisationRouter = require('./routes/OrganisationRoutes.js')

const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
    origin: ['http://localhost:5173','https://nourish360.vercel.app'], // Your frontend URL
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));



//Routes
app.use('/api/events', EventRouter);
app.use('/api/organisations', OrganisationRouter);
// app.use("/api/payments", paymentRoute);

app.get("/api/getkey", (req, res) =>
    res.status(200).json({ key: process.env.RAZORPAY_API_KEY })
  );

app.post("/order", async (req, res) => {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const options = req.body;
    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).send("Error");
    }

    res.json(order);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error");
  }
});

app.post("/order/validate", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
  req.body;

  const sha = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
 
  sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = sha.digest("hex");
  if (digest !== razorpay_signature) {
    return res.status(400).json({ msg: "Transaction is not legit!" });
  }

  res.json({
    msg: "success",
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
  });
});

app.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`);
});














