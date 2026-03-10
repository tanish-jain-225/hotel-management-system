import { Router } from "express";
import { ObjectId } from "mongodb";
import { getCollection } from "../config/database.js";

const router = Router();

// POST /orders — Place a customer order
router.post("/", async (req, res, next) => {
  try {
    const { sessionId, name, contact, address, paymentMethod, items, subtotal, gstAmount, grandTotal } = req.body;

    if (!sessionId || !name || !contact || !address || !paymentMethod || !items?.length) {
      return res.status(400).json({ message: "All order fields are required" });
    }

    if (isNaN(subtotal) || isNaN(gstAmount) || isNaN(grandTotal)) {
      return res.status(400).json({ message: "Invalid price values" });
    }

    const customerOrders = await getCollection("customerOrders");
    const orderCount = await customerOrders.countDocuments();
    const serialNumber = orderCount + 1;

    const orderData = {
      serialNumber,
      sessionId,
      customer: { name, contact, address },
      items,
      paymentMethod,
      subtotal: parseFloat(subtotal.toFixed(2)),
      gstAmount: parseFloat(gstAmount.toFixed(2)),
      grandTotal: parseFloat(grandTotal.toFixed(2)),
      orderDate: new Date(),
    };

    const result = await customerOrders.insertOne(orderData);
    if (!result.acknowledged) throw new Error("Failed to place order");

    res.status(201).json({ message: "Order placed successfully", orderId: result.insertedId, serialNumber });
  } catch (error) {
    next(error);
  }
});

// GET /orders — Fetch customer orders (all or filtered by sessionId)
router.get("/", async (req, res, next) => {
  try {
    const { sessionId } = req.query;
    const query = sessionId ? { sessionId } : {};
    const orders = await (await getCollection("customerOrders")).find(query).toArray();
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

// DELETE /orders/:id — Mark order as completed
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const result = await (await getCollection("customerOrders")).deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order completed" });
  } catch (error) {
    next(error);
  }
});

export default router;
