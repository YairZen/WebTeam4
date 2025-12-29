import mongoose from "mongoose";


// connect to online mongo db
const MONGO_URI = "mongodb+srv://yairzen:123456Aa@cluster0.8d8voyd.mongodb.net/teaminsight";



// singelton design pattern :
// to avoid multiple connections in dev

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;

  await mongoose.connect(MONGO_URI);
}
