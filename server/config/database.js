import { MongoClient } from "mongodb";

const DB_NAME = "hotelMenu";

let client;
let db;

export async function connectToDatabase() {
  try {
    client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

export function getCollection(name) {
  if (!db) throw new Error("Database not initialized");
  return db.collection(name);
}

export async function closeConnection() {
  if (client) {
    await client.close();
    console.log("MongoDB connection closed");
  }
}
