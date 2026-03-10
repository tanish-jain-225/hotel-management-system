import { Router } from "express";
import { ObjectId } from "mongodb";
import { getCollection } from "../config/database.js";

const router = Router();

// POST /cart — Add item to cart
router.post("/", async (req, res, next) => {
  try {
    const { sessionId, name, price, quantity, image, cuisine, section } = req.body;

    if (!sessionId || !name || !price || !quantity) {
      return res.status(400).json({ message: "Session ID, name, price, and quantity are required" });
    }

    const cartItem = { sessionId, name, price, quantity, image, cuisine, section };
    const result = await (await getCollection("orders")).insertOne(cartItem);

    if (!result.acknowledged) {
      throw new Error("Failed to add item to cart");
    }

    res.status(201).json({ message: "Item added to cart", cartItem });
  } catch (error) {
    next(error);
  }
});

// GET /cart — Fetch cart items by session ID
router.get("/", async (req, res, next) => {
  try {
    const { sessionId } = req.query;
    if (!sessionId) return res.status(400).json({ message: "Session ID is required" });

    const items = await (await getCollection("orders")).find({ sessionId }).toArray();
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

    await (await getCollection("orders")).deleteMany({ sessionId });
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

    const result = await (await getCollection("orders")).deleteOne({
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
