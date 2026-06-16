import { Router } from "express";
import { ObjectId } from "mongodb";
import { getCollection } from "../config/database.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

// GET /menu — Fetch all menu items
router.get("/", async (req, res, next) => {
  try {
    const items = await (await getCollection("menuItems")).find().toArray();
    res.json(items);
  } catch (error) {
    next(error);
  }
});

// POST /menu — Add a new menu item (protected)
router.post("/", authMiddleware, async (req, res, next) => {
  try {
    const { name, cuisine, section, price, image, info, available } = req.body;

    if (!name || !cuisine || !section || !price || !image || !info) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ message: "Price must be a valid positive number" });
    }

    const newItem = {
      name: name.trim(),
      cuisine: cuisine.trim(),
      section: section.trim(),
      price: parsedPrice,
      image: image.trim(),
      info: info.trim(),
      available: available !== undefined ? Boolean(available) : true
    };

    const result = await (await getCollection("menuItems")).insertOne(newItem);
    res.status(201).json({ message: "Menu item added successfully", newItem: { ...newItem, _id: result.insertedId } });
  } catch (error) {
    next(error);
  }
});

// POST /menu/check — Check if a menu item with the same name exists
router.post("/check", async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Dish name is required" });

    const existing = await (await getCollection("menuItems")).findOne({ name: name.trim() });
    res.json({ exists: !!existing });
  } catch (error) {
    next(error);
  }
});

// PUT /menu/:id — Update an existing menu item (protected)
router.put("/:id", authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, cuisine, section, price, image, info, available } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid menu item ID" });
    }

    if (!name || !cuisine || !section || !price || !image || !info) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ message: "Price must be a valid positive number" });
    }

    const isAvailable = available !== undefined ? Boolean(available) : true;

    const result = await (await getCollection("menuItems")).updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name: name.trim(),
          cuisine: cuisine.trim(),
          section: section.trim(),
          price: parsedPrice,
          image: image.trim(),
          info: info.trim(),
          available: isAvailable,
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.json({
      message: "Menu item updated successfully",
      updatedItem: { _id: id, name, cuisine, section, price: parsedPrice, image, info, available: isAvailable }
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /menu/:id — Delete a menu item by ID (protected)
router.delete("/:id", authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid menu item ID" });
    }

    const result = await (await getCollection("menuItems")).deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
