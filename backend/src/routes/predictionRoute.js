/*
 * ============================================================
 *  PREDICTION ROUTES
 *  Base path : /api/prediction  (registered in app.js)
 *
 *  POST  /api/prediction/run           → runPrediction
 *  GET   /api/prediction/all           → getAllPredictions
 *  GET   /api/prediction/high-risk     → getHighRisk
 *  POST  /api/prediction/reallocation  → getReallocationSuggestions
 * ============================================================
 */

import { Router } from "express";
import {
    runPrediction,
    getAllPredictions,
    getHighRisk,
    getReallocationSuggestions,
} from "../controllers/predictionController.js";
import { protect, adminOnly } from "../middleware/Auth.middleware.js";

const router = Router();

router.post("/run",             protect, adminOnly, runPrediction);
router.get("/all",              protect, getAllPredictions);
router.get("/high-risk",        protect, getHighRisk);
router.post("/reallocation",    protect, getReallocationSuggestions);

export default router;