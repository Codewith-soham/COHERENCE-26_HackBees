// ============================================================
// FILE: D:\BudgetSetu\backend\middleware\authMiddleware.js
// ============================================================
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const JWT_SECRET = process.env.JWT_SECRET || "budgetsetu_secret_change_in_prod";

// ── Protect — any logged-in officer ─────────────────────────
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new ApiError(401, "Not authenticated. Please log in.");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user    = await User.findById(decoded.id);

    if (!user)          throw new ApiError(401, "User no longer exists");
    if (!user.isActive) throw new ApiError(403, "Account deactivated");

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new ApiError(401, "Session expired. Please log in again.");
    }
    if (err.name === "JsonWebTokenError") {
      throw new ApiError(401, "Invalid token. Please log in again.");
    }
    throw err;
  }
});

// ── Admin only ───────────────────────────────────────────────
export const adminOnly = asyncHandler(async (req, res, next) => {
  if (req.user?.role !== "admin") {
    throw new ApiError(403, "Access denied. Admin only.");
  }
  next();
});