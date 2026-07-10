import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI");
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = {
    conn: null,
    promise: null,
  };
}


export async function connectDB() {
  try {
    if (mongoose.connection.readyState >= 1) {
      console.log("Already Connected");
      return;
    }

    await mongoose.connect(process.env.MONGODB_URI!);

    console.log("Mongo Connected ✅");
  } catch (err) {
    console.error("Mongo Error:", err);
    throw err;
  }
}