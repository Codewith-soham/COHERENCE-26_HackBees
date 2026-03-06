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

const router = Router();

// -- Specific named routes first --
router.post("/analyze",           analyzeBudget);
router.get("/all",                getAllBudgets);
router.get("/department/:dept",   getBudgetByDepartment);
router.get("/district/:dist",     getBudgetByDistrict);

// -- Parameterized route last to avoid conflicts --
router.get("/:id",                getBudgetById);

export default router;