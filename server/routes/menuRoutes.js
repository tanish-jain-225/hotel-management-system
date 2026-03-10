import { Router } from "express";
import { ObjectId } from "mongodb";
import { getCollection } from "../config/database.js";

const router = Router();

// GET /menu — Fetch all menu items
router.get("/", async (req, res, next) => {
  try {
    const items = await getCollection("menuItems").find().toArray();
    res.json(items);
  } catch (error) {
    next(error);
  }
});

// POST /menu — Add a new menu item
router.post("/", async (req, res, next) => {
  try {
    const { name, cuisine, section, price, image, info } = req.body;

    if (!name || !cuisine || !section || !price || !image || !info) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newItem = { name, cuisine, section, price, image, info };
    await getCollection("menuItems").insertOne(newItem);
    res.status(201).json({ message: "Menu item added successfully", newItem });
  } catch (error) {
    next(error);
  }
});

// POST /menu/check — Check if a menu item with the same name exists
router.post("/check", async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Dish name is required" });

    const existing = await getCollection("menuItems").findOne({ name: name.trim() });
    res.json({ exists: !!existing });
  } catch (error) {
    next(error);
  }
});

// DELETE /menu/:id — Delete a menu item by ID
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid menu item ID" });
    }

    const result = await getCollection("menuItems").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
