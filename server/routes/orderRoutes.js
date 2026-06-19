import { Router } from "express";
import { ObjectId } from "mongodb";
import { getCollection, COLLECTIONS } from "../config/database.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

// POST /orders — Place a customer order
router.post("/", async (req, res, next) => {
  try {
    const { sessionId, name, contact, address, paymentMethod, items } = req.body;

    if (!sessionId || !name || !contact || !address || !paymentMethod || !items?.length) {
      return res.status(400).json({ message: "All order fields are required" });
    }

    const menuCol = await getCollection(COLLECTIONS.menuItems);
    let calculatedSubtotal = 0;
    const verifiedItems = [];

    // Verify each item's price against the database
    const itemNames = items.map(it => String(it.name).trim());
    const dbItems = await menuCol.find({ name: { $in: itemNames } }).toArray();
    const dbItemsMap = new Map(dbItems.map(it => [it.name, it]));

    for (const item of items) {
      const dbItem = dbItemsMap.get(item.name.trim());
      if (!dbItem) {
        return res.status(400).json({ message: `Item '${item.name}' not found in the menu.` });
      }

      if (dbItem.available === false) {
        return res.status(400).json({ message: `Item '${item.name}' is currently out of stock.` });
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

    const settingsCol = await getCollection(COLLECTIONS.systemSettings);
    let settings = await settingsCol.findOne({ _id: "system_settings" });
    const gstRatePercent = settings && typeof settings.gstRate === "number" ? settings.gstRate : 5;
    const gstRateFraction = gstRatePercent / 100;

    const gstAmount = calculatedSubtotal * gstRateFraction;
    const grandTotal = calculatedSubtotal + gstAmount;

    const countersCol = await getCollection(COLLECTIONS.counters);
    const counter = await countersCol.findOneAndUpdate(
      { _id: "orderSerialNumber" },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: "after" }
    );
    const serialNumber = counter.seq;

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

    const customerOrders = await getCollection(COLLECTIONS.customerOrders);
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
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // If no sessionId, this is an admin request for ALL orders
    if (!sessionId) {
      return authMiddleware(req, res, async () => {
        const { status } = req.query;
        let query;
        if (status === "Completed") {
          query = {
            status: "Completed",
            $or: [
              { completedAt: { $gte: twentyFourHoursAgo } },
              { completedAt: { $exists: false }, orderDate: { $gte: twentyFourHoursAgo } }
            ]
          };
        } else {
          query = { status: { $ne: "Completed" } };
        }
        const orders = await (await getCollection(COLLECTIONS.customerOrders)).find(query).sort({ orderDate: -1 }).toArray();
        res.json(orders);
      });
    }

    // Otherwise, fetch orders for specific session (customer)
    // Only return active orders, or completed orders from the last 24 hours
    const query = {
      sessionId,
      $or: [
        { status: { $ne: "Completed" } },
        {
          status: "Completed",
          $or: [
            { completedAt: { $gte: twentyFourHoursAgo } },
            { completedAt: { $exists: false }, orderDate: { $gte: twentyFourHoursAgo } }
          ]
        }
      ]
    };
    const orders = await (await getCollection(COLLECTIONS.customerOrders)).find(query).sort({ orderDate: -1 }).toArray();
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

    const result = await (await getCollection(COLLECTIONS.customerOrders)).updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "Completed", completedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order completed" });
  } catch (error) {
    next(error);
  }
});

// PUT /orders/:id/status — Update order status (protected)
router.put("/:id/status", authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["Placed", "Preparing", "Ready", "Completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const updateFields = { status };
    if (status === "Completed") {
      updateFields.completedAt = new Date();
    }

    const result = await (await getCollection(COLLECTIONS.customerOrders)).updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: `Order status updated to ${status}` });
  } catch (error) {
    next(error);
  }
});

export default router;
