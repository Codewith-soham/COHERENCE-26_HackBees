// ============================================================
// FILE: D:\BudgetSetu\backend\controllers\authController.js
// ============================================================
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const JWT_SECRET  = process.env.JWT_SECRET  || "budgetsetu_secret_change_in_prod";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

// ── Generate JWT ─────────────────────────────────────────────
const generateToken = (userId) =>
  jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

// ── POST /api/auth/register ──────────────────────────────────
export const register = asyncHandler(async (req, res) => {
  const { fullName, officerId, email, password, department, state } = req.body;

  if (!fullName || !officerId || !email || !password) {
    throw new ApiError(400, "fullName, officerId, email and password are required");
  }

  // Check duplicates
  const existingEmail    = await User.findOne({ email: email.toLowerCase() });
  const existingOfficer  = await User.findOne({ officerId: officerId.toUpperCase() });

  if (existingEmail)   throw new ApiError(409, "Email already registered");
  if (existingOfficer) throw new ApiError(409, "Officer ID already registered");

  const user = await User.create({
    fullName,
    officerId: officerId.toUpperCase(),
    email:     email.toLowerCase(),
    password,
    department: department || "All",
    state:      state      || "All",
  });

  const token = generateToken(user._id);

  return res.status(201).json(
    new ApiResponse(201, { user, token }, "Registration successful")
  );
});

// ── POST /api/auth/login ─────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  // identifier = email OR officerId

  if (!identifier || !password) {
    throw new ApiError(400, "identifier (email or officerId) and password are required");
  }

  // Find by email or officerId
  const user = await User.findOne({
    $or: [
      { email:     identifier.toLowerCase() },
      { officerId: identifier.toUpperCase() },
    ],
  }).select("+password");

  if (!user) throw new ApiError(401, "Invalid credentials");
  if (!user.isActive) throw new ApiError(403, "Account is deactivated. Contact admin.");

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(401, "Invalid credentials");

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id);

  return res.status(200).json(
    new ApiResponse(200, { user, token }, "Login successful")
  );
});

// ── GET /api/auth/me ─────────────────────────────────────────
export const getMe = asyncHandler(async (req, res) => {
  // req.user is set by the protect middleware
  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, "User not found");

  return res.status(200).json(
    new ApiResponse(200, user, "User fetched successfully")
  );
});

// ── POST /api/auth/logout ────────────────────────────────────
export const logout = asyncHandler(async (req, res) => {
  // JWT is stateless — client deletes token on their side
  return res.status(200).json(
    new ApiResponse(200, null, "Logged out successfully")
  );
});