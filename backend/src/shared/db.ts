import mongoose from "mongoose";

export async function connectDb(): Promise<void> {
  const uri = process.env.MONGO_URI ?? "mongodb://localhost:27018/app_template";
  await mongoose.connect(uri);
  console.log(JSON.stringify({ level: "INFO", module: "db", message: `Connected to ${uri}` }));
}
