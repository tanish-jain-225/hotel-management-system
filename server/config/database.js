import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = "hotelMenu";
const COLLECTIONS = {
  adminCredentials: "adminCredentials",
  menuItems: "menuItems",
  orders: "orders",
  customerOrders: "customerOrders",
  systemSettings: "systemSettings",
};

let client;
let db;
let connectionPromise;

// Helper function to seed initial admin credentials securely
async function seedAdminCredentials(database) {
  try {
    const adminCol = database.collection(COLLECTIONS.adminCredentials);
    const count = await adminCol.countDocuments();
    if (count === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("123456", salt);
      await adminCol.insertOne({
        username: "admin",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log("Seeded default admin credentials successfully.");
    }
  } catch (error) {
    console.error("Error seeding admin credentials:", error);
  }
}

// Helper function to migrate plain text passwords to bcrypt hashes
async function migrateAdminCredentials(database) {
  try {
    const adminCol = database.collection(COLLECTIONS.adminCredentials);
    const admin = await adminCol.findOne();
    if (admin && admin.password) {
      const passwordStr = String(admin.password);
      // Bcrypt hash check (starts with $2a$, $2b$, or $2y$)
      const isHashed = /^\$2[ayb]\$.{56}$/.test(passwordStr);
      if (!isHashed) {
        console.log("Migrating plain-text admin password to bcrypt hash...");
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(passwordStr, salt);
        await adminCol.updateOne(
          { _id: admin._id },
          { $set: { password: hashedPassword, updatedAt: new Date() } }
        );
        console.log("Admin credentials migrated to bcrypt successfully.");
      }
    }
  } catch (error) {
    console.error("Error migrating admin credentials:", error);
  }
}

export async function connectToDatabase() {
  if (db) return db;

  if (!connectionPromise) {
    connectionPromise = (async () => {
      try {
        client = new MongoClient(MONGO_URI, {
          connectTimeoutMS: 10000,
          serverSelectionTimeoutMS: 10000
        });
        await client.connect();
        db = client.db(DB_NAME);
        console.log("Connected to MongoDB");

        // Seed and migrate admin credentials
        await seedAdminCredentials(db);
        await migrateAdminCredentials(db);

        // Ensure TTL index on cartItems collection
        try {
          const cartCol = db.collection("cartItems");
          await cartCol.createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 });
          console.log("Ensured TTL index on cartItems collection");
        } catch (idxError) {
          console.error("Error creating TTL index on cartItems:", idxError);
        }

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
