import { Router } from "express";
import { getCollection } from "../config/database.js";

const router = Router();

// POST /admin/login — Verify admin credentials (server-side only)
router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const admin = await getCollection("adminCredentials").findOne();

    if (!admin) {
      return res.status(404).json({ message: "Admin credentials not configured" });
    }

    if (String(admin.username) !== String(username) || String(admin.password) !== String(password)) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    res.json({ message: "Login successful" });
  } catch (error) {
    next(error);
  }
});

// PUT /admin/credentials — Update admin credentials (verifies old creds first)
router.put("/credentials", async (req, res, next) => {
  try {
    const { prevUsername, prevPassword, newUsername, newPassword } = req.body;

    if (!prevUsername || !prevPassword || !newUsername || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const admin = await getCollection("adminCredentials").findOne();

    if (!admin) {
      return res.status(404).json({ message: "Admin credentials not configured" });
    }

    if (String(admin.username) !== String(prevUsername) || String(admin.password) !== String(prevPassword)) {
      return res.status(401).json({ message: "Previous credentials are incorrect" });
    }

    await getCollection("adminCredentials").updateOne(
      {},
      { $set: { username: newUsername, password: newPassword } },
      { upsert: true }
    );

    res.json({ message: "Credentials updated successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
