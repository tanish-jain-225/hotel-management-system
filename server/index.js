import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { closeConnection } from "./config/database.js";
import menuRoutes from "./routes/menuRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT;

// Enable trust proxy for correct client IP detection in rate limiting (especially on Vercel/proxies)
app.set("trust proxy", 1);

// Environment validation
if (!process.env.MONGO_URI) {
  console.error("FATAL ERROR: MONGO_URI is not defined in the environment.");
  process.exit(1);
}
if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in production mode.");
  process.exit(1);
}

// Rate Limiting (Relaxed in non-production environments to support testing and active local development)
const isDevOrTest = process.env.NODE_ENV !== "production" || process.env.VITEST;

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevOrTest ? 10000 : 1000, // accommodate active client/admin polling
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later" }
});

const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevOrTest ? 1000 : 30, // limit order placement spam
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many checkout or cart attempts, please try again later" }
});

// Middleware
app.use(cors({ origin: true }));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json());
app.use(globalLimiter);

// Target rate limiting strictly to sensitive write endpoints
app.post("/orders", checkoutLimiter);
app.post("/cart", checkoutLimiter);

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
if (process.env.NODE_ENV !== "test" && !process.env.VITEST) {
  const port = PORT || 5000;
  app.listen(port, () => console.log(`Server running on port ${port}`));
}

// Graceful Shutdown
process.on("SIGINT", async () => {
  await closeConnection();
  process.exit(0);
});

export default app;