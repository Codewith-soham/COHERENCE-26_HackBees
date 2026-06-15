/*
 * ============================================================
 *  ANOMALY ROUTES
 *  Base path : /api/anomaly  (registered in app.js)
 *
 *  GET  /api/anomaly/all                → getAllAnomalies
 *  GET  /api/anomaly/high               → getHighSeverity
 *  GET  /api/anomaly/department/:dept   → getAnomalyByDepartment
 *
 *  NOTE: There is no POST route here.
 *  Anomaly documents are created internally by analyzeBudget
 *  in budgetController — never directly via API.
 * ============================================================
 */

import { Router } from "express";
import {
    getAllAnomalies,
    getHighSeverity,
    getAnomalyByDepartment,
} from "../controllers/anomalyController.js";
import { protect } from "../middleware/Auth.middleware.js";

const router = Router();

router.get("/all",               protect, getAllAnomalies);
router.get("/high",              protect, getHighSeverity);
router.get("/department/:dept",  protect, getAnomalyByDepartment);

export default router;