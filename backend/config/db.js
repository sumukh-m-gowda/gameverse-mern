import mongoose from "mongoose";

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    throw new Error("MONGO_URI is missing from .env");
  }

  await mongoose.connect(mongoURI);
  console.log("MongoDB connected successfully");
};

export default connectDB;