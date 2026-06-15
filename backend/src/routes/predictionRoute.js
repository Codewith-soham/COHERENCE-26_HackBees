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

const router = Router();

router.post("/run",             runPrediction);
router.get("/all",              getAllPredictions);
router.get("/high-risk",        getHighRisk);
router.post("/reallocation",    getReallocationSuggestions);

export default router;