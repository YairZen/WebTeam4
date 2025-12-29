import mongoose from "mongoose";

const MONGO_URI = "mongodb://127.0.0.1:27017/teaminsight";

// singelton design pattern :
// to avoid multiple connections in dev

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;

  await mongoose.connect(MONGO_URI);
}
