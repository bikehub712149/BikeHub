import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI");
}

export async function connectDB() {
  try {
    // Reuse an existing Mongoose connection across requests in the same server process.
    if (mongoose.connection.readyState >= 1) {
      return;
    }

    await mongoose.connect(process.env.MONGODB_URI!);

    console.log("Mongo Connected ✅");
  } catch (err) {
    throw err;
  }
}