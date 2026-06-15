// ============================================================
// FILE: D:\BudgetSetu\backend\routes\authRoute.js
// ============================================================
import express from "express";
import { register, login, getMe, logout } from "../controllers/AuthController.js";
import { protect } from "../middleware/Auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login",    login);
router.get ("/me",       protect, getMe);
router.post("/logout",   protect, logout);

export default router;