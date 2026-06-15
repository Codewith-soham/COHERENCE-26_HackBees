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

const router = Router();

router.get("/all",               getAllAnomalies);
router.get("/high",              getHighSeverity);
router.get("/department/:dept",  getAnomalyByDepartment);

export default router;