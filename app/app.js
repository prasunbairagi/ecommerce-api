import dotenv from "dotenv";
dotenv.config();
import express from "express";
import Stripe from 'stripe';
import dbConnect from "../config/dbConnect.js";
import userRoutes from "../routes/usersRoute.js";
import productRouter from "../routes/productsRoute.js";
import categoriesRouter from "../routes/categoriesRoute.js";
import brandsRouter from "../routes/brandsRoute.js";
import colorsRouter from "../routes/colorsRoute.js";
import reviewsRouter from "../routes/reviewsRoute.js";
import ordersRouter from "../routes/ordersRoute.js";
import couponsRouter from "../routes/couponsRoute.js";
import { globalErrHandler, notFound } from "../middlewares/globalErrHandler.js";
import Order from "../model/Order.js";
// Initialize database connection
dbConnect();

const stripe = new Stripe(process.env.STRIPE_KEY);
const endpointSecret = 'whsec_1b163620b48e9697406f65ea3b86a253d67dc24e88efae862d949dacec9f6e71';
const app = express();

// Middleware for JSON parsing
app.use((req, res, next) => {
  // Skip JSON parsing for the webhook route
  if (req.originalUrl === '/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Routes
app.use("/api/v1/users/", userRoutes);
app.use("/api/v1/products/", productRouter);
app.use("/api/v1/categories/", categoriesRouter);
app.use("/api/v1/brands/", brandsRouter);
app.use("/api/v1/colors/", colorsRouter);
app.use("/api/v1/reviews/", reviewsRouter);
app.use("/api/v1/orders/", ordersRouter);
app.use("/api/v1/coupons/", couponsRouter);
// stripe webhook
app.post('/webhook', express.raw({type: 'application/json'}), async (request, response) => {
  let event = request.body;
  // Only verify the event if you have an endpoint secret defined.
  // Otherwise use the basic event deserialized with JSON.parse
  if (endpointSecret) {
    // Get the signature sent by Stripe
    const signature = request.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(
        request.body,
        signature,
        endpointSecret
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`, err.message);
      return response.sendStatus(400);
    }
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      console.log('checkout completed');
      const session = event.data.object;
      const { orderId } = session.metadata;
      const paymentStatus = session.payment_status;
      const paymentMethod = session.payment_method_types[0];
      const totalAmount = session.amount_total;
      const currency = session.currency;
      const order = await Order.findByIdAndUpdate(
        JSON.parse(orderId),
        {
          totalPrice : totalAmount/ 100,
          currency,
          paymentStatus,
          paymentMethod
        },
        {
          new: true
        }
      );
      console.log(order);
      break;
  }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
});

// Error middleware
app.use(notFound); // 404 handler
app.use(globalErrHandler);

app.listen(4242, () => console.log('Running on port 4242'));

export default app;
