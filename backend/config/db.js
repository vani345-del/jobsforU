import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL);
    console.log("MongoDB Connected sucessfully");
  } catch (error) {
    console.error("MongoDB Error:", error.message);
    throw error; // Let the caller handle it (or Express error handler)
  }
};

export default connectDB;
