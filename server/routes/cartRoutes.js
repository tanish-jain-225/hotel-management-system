import { Router } from "express";
import { ObjectId } from "mongodb";
import { getCollection } from "../config/database.js";

const router = Router();

// POST /cart — Add item to cart
router.post("/", async (req, res, next) => {
  try {
    const { sessionId, name, quantity } = req.body;

    if (!sessionId || !name || quantity === undefined) {
      return res.status(400).json({ message: "Session ID, name, and quantity are required" });
    }

    const parsedQty = parseInt(quantity);
    if (isNaN(parsedQty)) {
      return res.status(400).json({ message: "Quantity must be a valid integer" });
    }

    const ordersCol = await getCollection("cartItems");

    // Check if item already exists in cart for this session
    const existingItem = await ordersCol.findOne({ sessionId, name: name.trim() });

    if (existingItem) {
      const newQty = (existingItem.quantity || 1) + parsedQty;
      if (newQty <= 0) {
        await ordersCol.deleteOne({ _id: existingItem._id });
        return res.json({ message: "Item removed from cart" });
      } else {
        await ordersCol.updateOne(
          { _id: existingItem._id },
          { $set: { quantity: newQty } }
        );
        return res.json({ message: "Item quantity updated", cartItem: { ...existingItem, quantity: newQty } });
      }
    }

    // If it doesn't exist, we only add it if quantity > 0
    if (parsedQty <= 0) {
      return res.status(400).json({ message: "Cannot add new item with zero or negative quantity" });
    }

    const menuCol = await getCollection("menuItems");
    const dbItem = await menuCol.findOne({ name: name.trim() });

    if (!dbItem) {
      return res.status(404).json({ message: `Item '${name}' not found in the menu.` });
    }

    const cartItem = {
      sessionId,
      name: dbItem.name,
      price: parseFloat(dbItem.price),
      quantity: parsedQty,
      image: dbItem.image,
      cuisine: dbItem.cuisine,
      section: dbItem.section,
      createdAt: new Date(),
    };

    const result = await ordersCol.insertOne(cartItem);

    if (!result.acknowledged) {
      throw new Error("Failed to add item to cart");
    }

    res.status(201).json({ message: "Item added to cart", cartItem: { ...cartItem, _id: result.insertedId } });
  } catch (error) {
    next(error);
  }
});

// GET /cart — Fetch cart items by session ID
router.get("/", async (req, res, next) => {
  try {
    const { sessionId } = req.query;
    if (!sessionId) return res.status(400).json({ message: "Session ID is required" });

    const items = await (await getCollection("cartItems")).find({ sessionId }).toArray();
    res.json(items);
  } catch (error) {
    next(error);
  }
});

// DELETE /cart/clear — Clear all cart items for a session (must be before /:id)
router.delete("/clear", async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ message: "Session ID is required" });

    await (await getCollection("cartItems")).deleteMany({ sessionId });
    res.json({ message: "Cart cleared successfully" });
  } catch (error) {
    next(error);
  }
});

// DELETE /cart/:id — Remove a specific cart item
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { sessionId } = req.body;

    if (!sessionId || !ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Valid session ID and item ID are required" });
    }

    const result = await (await getCollection("cartItems")).deleteOne({
      _id: new ObjectId(id),
      sessionId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.json({ message: "Item removed from cart" });
  } catch (error) {
    next(error);
  }
});

export default router;
