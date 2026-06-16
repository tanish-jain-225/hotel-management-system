import { vi, describe, it, expect, beforeEach } from "vitest";
import request from "supertest";

// Mock the database configuration in-memory for testing
vi.mock("../config/database.js", () => {
  const mockDb = {
    menuItems: [],
    cartItems: [],
    customerOrders: [],
    systemSettings: [{ _id: "system_settings", gstRate: 5 }],
    counters: [],
    adminCredentials: []
  };

  const getCollectionMock = async (name) => {
    return {
      find: () => ({
        toArray: async () => mockDb[name] || [],
        sort: () => ({
          toArray: async () => mockDb[name] || []
        })
      }),
      findOne: async (query) => {
        const list = mockDb[name] || [];
        return list.find(item => {
          return Object.keys(query).every(key => String(item[key]) === String(query[key]));
        });
      },
      insertOne: async (doc) => {
        const list = mockDb[name] || [];
        const insertedId = "mock_id_" + Math.random().toString(36).substr(2, 9);
        const newDoc = { ...doc, _id: insertedId };
        list.push(newDoc);
        return { acknowledged: true, insertedId };
      },
      updateOne: async (query, update) => {
        const list = mockDb[name] || [];
        const itemIndex = list.findIndex(item => {
          return Object.keys(query).every(key => String(item[key]) === String(query[key]));
        });
        if (itemIndex > -1) {
          if (update.$set) {
            list[itemIndex] = { ...list[itemIndex], ...update.$set };
          }
          return { matchedCount: 1, modifiedCount: 1 };
        }
        return { matchedCount: 0, modifiedCount: 0 };
      },
      deleteOne: async (query) => {
        const list = mockDb[name] || [];
        const itemIndex = list.findIndex(item => {
          return Object.keys(query).every(key => String(item[key]) === String(query[key]));
        });
        if (itemIndex > -1) {
          list.splice(itemIndex, 1);
          return { deletedCount: 1 };
        }
        return { deletedCount: 0 };
      },
      deleteMany: async (query) => {
        if (!mockDb[name]) return { deletedCount: 0 };
        const originalCount = mockDb[name].length;
        mockDb[name] = mockDb[name].filter(item => {
          return !Object.keys(query).every(key => String(item[key]) === String(query[key]));
        });
        return { deletedCount: originalCount - mockDb[name].length };
      },
      findOneAndUpdate: async (query, update, options) => {
        const list = mockDb[name] || [];
        let item = list.find(item => {
          return Object.keys(query).every(key => String(item[key]) === String(query[key]));
        });
        if (!item) {
          if (options && options.upsert) {
            item = { ...query, seq: 0 };
            list.push(item);
          } else {
            return null;
          }
        }
        if (update.$inc) {
          for (const key of Object.keys(update.$inc)) {
            item[key] = (item[key] || 0) + update.$inc[key];
          }
        }
        return item;
      },
      countDocuments: async () => {
        return (mockDb[name] || []).length;
      }
    };
  };

  return {
    connectToDatabase: async () => ({}),
    getCollection: getCollectionMock,
    closeConnection: async () => ({}),
    _mockDb: mockDb
  };
});

import app from "../index.js";
import { _mockDb } from "../config/database.js";

// Seed sample data before each test
beforeEach(() => {
  _mockDb.menuItems = [
    {
      _id: "paneer_tikka_id",
      name: "Paneer Tikka",
      cuisine: "North Indian",
      section: "Starters",
      price: 249,
      image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8",
      info: "Char-grilled paneer cubes marinated in spices"
    }
  ];
  _mockDb.cartItems = [];
  _mockDb.customerOrders = [];
  _mockDb.systemSettings = [{ _id: "system_settings", gstRate: 5 }];
  _mockDb.counters = [];
  _mockDb.adminCredentials = [
    {
      username: "admin",
      password: "$2a$10$xyz" // Mocked hashed password (we will mock bcrypt for login check or test directly)
    }
  ];
});

describe("DineEase API Integration Tests", () => {
  
  describe("Health Check", () => {
    it("should return a healthy status", async () => {
      const res = await request(app).get("/");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("Server is healthy");
    });
  });

  describe("Menu API", () => {
    it("should return a list of menu items", async () => {
      const res = await request(app).get("/menu");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe("Paneer Tikka");
    });
  });

  describe("Cart API", () => {
    it("should add a new item to the cart", async () => {
      const res = await request(app)
        .post("/cart")
        .send({
          sessionId: "test-session",
          name: "Paneer Tikka",
          quantity: 1
        });
      
      expect(res.status).toBe(201);
      expect(res.body.cartItem.name).toBe("Paneer Tikka");
      expect(res.body.cartItem.quantity).toBe(1);
      expect(_mockDb.cartItems.length).toBe(1);
    });

    it("should increment quantity of an existing item in the cart", async () => {
      // Pre-populate cart
      _mockDb.cartItems.push({
        sessionId: "test-session",
        name: "Paneer Tikka",
        price: 249,
        quantity: 2,
        image: "",
        cuisine: "",
        section: ""
      });

      const res = await request(app)
        .post("/cart")
        .send({
          sessionId: "test-session",
          name: "Paneer Tikka",
          quantity: 3
        });
      
      expect(res.status).toBe(200);
      expect(res.body.cartItem.quantity).toBe(5);
      expect(_mockDb.cartItems.length).toBe(1);
    });

    it("should delete item when quantity is decremented to zero or below", async () => {
      _mockDb.cartItems.push({
        sessionId: "test-session",
        name: "Paneer Tikka",
        price: 249,
        quantity: 1,
        image: "",
        cuisine: "",
        section: ""
      });

      const res = await request(app)
        .post("/cart")
        .send({
          sessionId: "test-session",
          name: "Paneer Tikka",
          quantity: -1
        });
      
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Item removed from cart");
      expect(_mockDb.cartItems.length).toBe(0);
    });

    it("should clear the entire cart", async () => {
      _mockDb.cartItems.push({
        sessionId: "test-session",
        name: "Paneer Tikka",
        price: 249,
        quantity: 1
      });

      const res = await request(app)
        .delete("/cart/clear")
        .send({ sessionId: "test-session" });
      
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Cart cleared successfully");
      expect(_mockDb.cartItems.length).toBe(0);
    });
  });

  describe("Orders API", () => {
    it("should place a new order and perform server-side price validation", async () => {
      const res = await request(app)
        .post("/orders")
        .send({
          sessionId: "test-session",
          name: "John Doe",
          contact: "1234567890",
          address: "Table 5",
          paymentMethod: "UPI",
          items: [
            {
              name: "Paneer Tikka",
              quantity: 2,
              price: 9999 // Client-side tampered price
            }
          ]
        });
      
      expect(res.status).toBe(201);
      // Backend should use DB price (249) instead of tampered price (9999)
      // Subtotal = 249 * 2 = 498
      // GST (5%) = 24.9
      // Grand Total = 522.9
      expect(res.body.grandTotal).toBe(522.9);
      expect(res.body.serialNumber).toBe(1);
      expect(_mockDb.customerOrders.length).toBe(1);
    });

    it("should atomically increment the order serial number", async () => {
      // First order
      await request(app)
        .post("/orders")
        .send({
          sessionId: "test-session",
          name: "John Doe",
          contact: "1234567890",
          address: "Table 5",
          paymentMethod: "UPI",
          items: [{ name: "Paneer Tikka", quantity: 1 }]
        });

      // Second order
      const res2 = await request(app)
        .post("/orders")
        .send({
          sessionId: "test-session-2",
          name: "Jane Doe",
          contact: "0987654321",
          address: "Table 6",
          paymentMethod: "Cash",
          items: [{ name: "Paneer Tikka", quantity: 1 }]
        });

      expect(res2.body.serialNumber).toBe(2);
    });

    it("should fail checkout if item is out of stock", async () => {
      _mockDb.menuItems[0].available = false;

      const res = await request(app)
        .post("/orders")
        .send({
          sessionId: "test-session",
          name: "John Doe",
          contact: "1234567890",
          address: "Table 5",
          paymentMethod: "UPI",
          items: [{ name: "Paneer Tikka", quantity: 1 }]
        });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toContain("out of stock");
    });
  });
});
