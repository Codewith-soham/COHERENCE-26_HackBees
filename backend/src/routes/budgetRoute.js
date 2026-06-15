/*
 * ============================================================
 *  BUDGET ROUTES
 *  Base path : /api/budget  (registered in app.js)
 *
 *  POST  /api/budget/analyze            → analyzeBudget
 *  GET   /api/budget/all                → getAllBudgets
 *  GET   /api/budget/department/:dept   → getBudgetByDepartment
 *  GET   /api/budget/district/:dist     → getBudgetByDistrict
 *  GET   /api/budget/:id                → getBudgetById
 *
 *  ⚠️  ORDER MATTERS:
 *  /department/:dept and /district/:dist must be registered
 *  BEFORE /:id — otherwise Express treats "department" and
 *  "district" as the :id param and hits the wrong controller.
 * ============================================================
 */

import { Router } from "express";
import {
    analyzeBudget,
    getAllBudgets,
    getBudgetById,
    getBudgetByDepartment,
    getBudgetByDistrict,
} from "../controllers/budgetController.js";
import { protect, adminOnly } from "../middleware/Auth.middleware.js";

const router = Router();

// -- Specific named routes first --
router.post("/analyze",           protect, adminOnly, analyzeBudget);
router.get("/all",                protect, getAllBudgets);
router.get("/department/:dept",   protect, getBudgetByDepartment);
router.get("/district/:dist",     protect, getBudgetByDistrict);

// -- Parameterized route last to avoid conflicts --
router.get("/:id",                protect, getBudgetById);

export default router;