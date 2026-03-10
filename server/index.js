import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { connectToDatabase, closeConnection } from "./config/database.js";
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

// Start Server
connectToDatabase().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

// Graceful Shutdown
process.on("SIGINT", async () => {
  await closeConnection();
  process.exit(0);
});

export default app;