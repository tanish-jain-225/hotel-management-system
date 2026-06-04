import { Router } from "express";
import { ObjectId } from "mongodb";
import { getCollection } from "../config/database.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

// POST /orders — Place a customer order
router.post("/", async (req, res, next) => {
  try {
    const { sessionId, name, contact, address, paymentMethod, items } = req.body;

    if (!sessionId || !name || !contact || !address || !paymentMethod || !items?.length) {
      return res.status(400).json({ message: "All order fields are required" });
    }

    const menuCol = await getCollection("menuItems");
    let calculatedSubtotal = 0;
    const verifiedItems = [];

    // Verify each item's price against the database
    for (const item of items) {
      const dbItem = await menuCol.findOne({ name: item.name.trim() });
      if (!dbItem) {
        return res.status(400).json({ message: `Item '${item.name}' not found in the menu.` });
      }

      const itemPrice = parseFloat(dbItem.price);
      const quantity = parseInt(item.quantity) || 1;
      const itemTotal = itemPrice * quantity;

      calculatedSubtotal += itemTotal;
      verifiedItems.push({
        name: dbItem.name,
        price: itemPrice,
        quantity: quantity,
        image: dbItem.image,
        cuisine: dbItem.cuisine,
        section: dbItem.section,
        totalPrice: itemTotal,
      });
    }

    const settingsCol = await getCollection("systemSettings");
    let settings = await settingsCol.findOne({ _id: "system_settings" });
    const gstRatePercent = settings && typeof settings.gstRate === "number" ? settings.gstRate : 5;
    const gstRateFraction = gstRatePercent / 100;

    const gstAmount = calculatedSubtotal * gstRateFraction;
    const grandTotal = calculatedSubtotal + gstAmount;

    const customerOrders = await getCollection("customerOrders");
    const orderCount = await customerOrders.countDocuments();
    const serialNumber = orderCount + 1;

    const orderData = {
      serialNumber,
      sessionId,
      customer: { name, contact, address },
      items: verifiedItems,
      paymentMethod,
      subtotal: parseFloat(calculatedSubtotal.toFixed(2)),
      gstAmount: parseFloat(gstAmount.toFixed(2)),
      grandTotal: parseFloat(grandTotal.toFixed(2)),
      orderDate: new Date(),
      status: "Placed" // Track live status
    };

    const result = await customerOrders.insertOne(orderData);
    if (!result.acknowledged) throw new Error("Failed to place order");

    res.status(201).json({ 
      message: "Order placed successfully", 
      orderId: result.insertedId, 
      serialNumber,
      grandTotal: orderData.grandTotal
    });
  } catch (error) {
    next(error);
  }
});

// GET /orders — Fetch customer orders (all for admin, specific for session)
router.get("/", async (req, res, next) => {
  try {
    const { sessionId } = req.query;
    
    // If no sessionId, this is an admin request for ALL orders
    if (!sessionId) {
      return authMiddleware(req, res, async () => {
        const orders = await (await getCollection("customerOrders")).find().sort({ orderDate: -1 }).toArray();
        res.json(orders);
      });
    }

    // Otherwise, fetch orders for specific session (customer)
    const orders = await (await getCollection("customerOrders")).find({ sessionId }).sort({ orderDate: -1 }).toArray();
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

// DELETE /orders/:id — Mark order as completed (protected)
router.delete("/:id", authMiddleware, async (req, res, next) => {
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
