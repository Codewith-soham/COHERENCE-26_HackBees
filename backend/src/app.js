// ============================================================
// FILE: D:\BudgetSetu\backend\app.js  — FULL REPLACEMENT
// ============================================================
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import config from "./config/index.js";

import budgetRoutes     from "./routes/budgetRoute.js";
import anomalyRoutes    from "./routes/anomalyRoute.js";
import predictionRoutes from "./routes/predictionRoute.js";
import authRoutes       from "./routes/AuthRoutes.js";          // ← NEW
import { errorHandler } from "./middleware/errorhandler.js";

const app = express();

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { success: false, error: "Too many requests from this IP, please try again later." }
});
app.use(limiter);

app.use(cors({
  origin: [
    config.FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:3000",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.use(express.json());

// ── Routes ───────────────────────────────────────────────────
app.use("/api/auth",       authRoutes);                        // ← NEW
app.use("/api/budget",     budgetRoutes);
app.use("/api/anomaly",    anomalyRoutes);
app.use("/api/prediction", predictionRoutes);

// ── Health Checks ─────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "BudgetFlow AI Backend is running" });
});
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "backend" });
});

// ── Global Error Handler ──────────────────────────────────────
app.use(errorHandler);

export { app };