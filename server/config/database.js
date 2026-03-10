import { MongoClient } from "mongodb";

const DB_NAME = "hotelMenu";

let client;
let db;
let connectionPromise;

export async function connectToDatabase() {
  if (db) return db;

  if (!connectionPromise) {
    connectionPromise = (async () => {
      try {
        client = new MongoClient(process.env.MONGO_URI);
        await client.connect();
        db = client.db(DB_NAME);
        console.log("Connected to MongoDB");
        return db;
      } catch (error) {
        connectionPromise = null;
        console.error("MongoDB connection error:", error);
        throw error;
      }
    })();
  }

  return connectionPromise;
}

export async function getCollection(name) {
  await connectToDatabase();
  return db.collection(name);
}

export async function closeConnection() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    connectionPromise = null;
    console.log("MongoDB connection closed");
  }
}
