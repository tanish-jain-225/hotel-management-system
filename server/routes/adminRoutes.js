import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
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

    // Verify Password with Bcrypt
    const isPasswordCorrect = await bcrypt.compare(password, admin.password);

    if (String(admin.username) === String(username) && isPasswordCorrect) {
      if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: "JWT_SECRET is not configured on the server" });
      }
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
router.put("/credentials", authMiddleware, async (req, res, next) => {
  try {
    const { prevUsername, prevPassword, newUsername, newPassword } = req.body;

    if (!prevUsername || !prevPassword || !newUsername || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    const credentialsCol = await getCollection("adminCredentials");
    const admin = await credentialsCol.findOne();

    if (!admin) {
      return res.status(404).json({ message: "Admin credentials not configured" });
    }

    // Verify previous credentials with Bcrypt
    const isPrevPasswordCorrect = await bcrypt.compare(prevPassword, admin.password);

    if (String(admin.username) === String(prevUsername) && isPrevPasswordCorrect) {
      // Hash the new password before storing it
      const salt = await bcrypt.genSalt(10);
      const hashedNewPassword = await bcrypt.hash(newPassword, salt);

      await credentialsCol.updateOne(
        {},
        { $set: { username: newUsername, password: hashedNewPassword } },
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

// GET /admin/settings — Get system settings (like GST rate)
router.get("/settings", async (req, res, next) => {
  try {
    const settingsCol = await getCollection("systemSettings");
    let settings = await settingsCol.findOne({ _id: "system_settings" });

    // Seed default settings if empty
    if (!settings) {
      settings = { _id: "system_settings", gstRate: 5 };
      await settingsCol.insertOne(settings);
    }

    res.json(settings);
  } catch (error) {
    next(error);
  }
});

// PUT /admin/settings — Update system settings (protected)
router.put("/settings", authMiddleware, async (req, res, next) => {
  try {
    const { gstRate } = req.body;

    const parsedGst = parseFloat(gstRate);
    if (isNaN(parsedGst) || parsedGst < 0 || parsedGst > 100) {
      return res.status(400).json({ message: "GST rate must be a valid percentage between 0 and 100" });
    }

    const settingsCol = await getCollection("systemSettings");
    await settingsCol.updateOne(
      { _id: "system_settings" },
      { $set: { gstRate: parsedGst } },
      { upsert: true }
    );

    res.json({ message: "Settings updated successfully", settings: { gstRate: parsedGst } });
  } catch (error) {
    next(error);
  }
});

// GET /admin/analytics — Retrieve dashboard analytics (protected)
router.get("/analytics", authMiddleware, async (req, res, next) => {
  try {
    const ordersCol = await getCollection("customerOrders");

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const activeOrdersCount = await ordersCol.countDocuments({ status: { $ne: "Completed" } });

    const completedTodayQuery = {
      status: "Completed",
      orderDate: { $gte: startOfToday, $lte: endOfToday }
    };
    const completedTodayCount = await ordersCol.countDocuments(completedTodayQuery);

    const completedTodayOrders = await ordersCol.find(completedTodayQuery).toArray();
    const revenueToday = completedTodayOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);

    res.json({
      activeOrders: activeOrdersCount,
      completedToday: completedTodayCount,
      revenueToday: parseFloat(revenueToday.toFixed(2))
    });
  } catch (error) {
    next(error);
  }
});

export default router;
