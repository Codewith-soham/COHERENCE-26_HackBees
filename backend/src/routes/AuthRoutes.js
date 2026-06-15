// ============================================================
// FILE: D:\BudgetSetu\backend\routes\authRoute.js
// ============================================================
import express from "express";
import { register, login, getMe, logout } from "../controllers/AuthController.js";
import { protect, adminOnly } from "../middleware/Auth.middleware.js";

const router = express.Router();

router.post("/register", protect, adminOnly, register);
router.post("/login",    login);
router.get ("/me",       protect, getMe);
router.post("/logout",   protect, logout);

export default router;