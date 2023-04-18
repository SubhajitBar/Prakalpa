import app from "./app.js";
import { connectDB } from "./config/database.js";
import cloudinary from "cloudinary";
import RazorPay from "razorpay";
import { Stats } from "./models/Stats.js";
import nodeCron from "node-cron";


connectDB();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
  api_key: process.env.CLOUDINARY_CLIENT_API,
  api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
});

export const instance = new RazorPay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

//   nodeCron.schedule("*=>sec *=>min *=>hrs *=>day *=>month *=>Years");
nodeCron.schedule("0 0 0 1 * *", async () => {

  try {
    await Stats.create({});
  } catch (error) {
    console.log(error);
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server is listen on port ${process.env.PORT}`)
})

