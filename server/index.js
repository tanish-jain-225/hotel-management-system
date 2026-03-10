import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { closeConnection } from "./config/database.js";
import menuRoutes from "./routes/menuRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors({ origin: true }));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json());

// Health Check
app.get("/", (req, res) => {
  res.json({ status: "Server is healthy" });
});

// Routes
app.use("/menu", menuRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/admin", adminRoutes);

// Global Error Handler
app.use(errorHandler);

// Start Server (local dev — on Vercel the exported app is used directly)
const port = PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));

// Graceful Shutdown
process.on("SIGINT", async () => {
  await closeConnection();
  process.exit(0);
});

export default app;