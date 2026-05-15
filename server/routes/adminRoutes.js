import { Router } from "express";
import jwt from "jsonwebtoken";
import { getCollection } from "../config/database.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

// POST /admin/login — Verify admin credentials and issue JWT
router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const adminCol = await getCollection("adminCredentials");
    const admin = await adminCol.findOne();

    if (!admin) {
      return res.status(404).json({ message: "Admin credentials not configured" });
    }

    console.log("DEBUG: Fetched Admin from DB:", admin);
    console.log("DEBUG: Entered Credentials:", { username, password });

    // Direct Plain-Text Comparison
    if (String(admin.username) === String(username) && String(admin.password) === String(password)) {
      // Generate JWT
      const token = jwt.sign(
        { id: admin._id, username: admin.username }, 
        process.env.JWT_SECRET, 
        { expiresIn: "24h" }
      );
      return res.json({ message: "Login successful", token });
    } else {
      return res.status(401).json({ message: "Invalid username or password" });
    }
  } catch (error) {
    next(error);
  }
});

// PUT /admin/credentials — Update admin credentials
router.put("/credentials", async (req, res, next) => {
  try {
    const { prevUsername, prevPassword, newUsername, newPassword } = req.body;

    if (!prevUsername || !prevPassword || !newUsername || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const credentialsCol = await getCollection("adminCredentials");
    const admin = await credentialsCol.findOne();

    if (!admin) {
      return res.status(404).json({ message: "Admin credentials not configured" });
    }

    console.log("DEBUG (Update): Fetched from DB:", { username: admin.username, password: admin.password });
    console.log("DEBUG (Update): Entered Previous:", { prevUsername, prevPassword });

    // Verify previous credentials (Plain Text)
    if (String(admin.username) === String(prevUsername) && String(admin.password) === String(prevPassword)) {
      await credentialsCol.updateOne(
        {},
        { $set: { username: newUsername, password: newPassword } },
        { upsert: true }
      );
      res.json({ message: "Credentials updated successfully" });
    } else {
      return res.status(401).json({ message: "Previous credentials are incorrect" });
    }
  } catch (error) {
    next(error);
  }
});

export default router;
