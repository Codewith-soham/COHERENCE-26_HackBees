/*
 * ============================================================
 *  ANOMALY CONTROLLER
 *  Handles all anomaly-related read operations:
 *  - Fetch every anomaly record (with linked budget data)
 *  - Fetch only HIGH severity anomalies (critical alerts)
 *  - Fetch anomalies filtered by department name
 *
 *  NOTE: Anomaly documents are never created directly via API.
 *  They are always created internally by analyzeBudget in
 *  budgetController as part of the budget analysis flow.
 * ============================================================
 */

import Anomaly from "../models/anomaly.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


/*
 * getAllAnomalies
 * --------------
 * What it does:
 *   Fetches every Anomaly document from MongoDB, sorted newest first.
 *   Uses .populate('budget_id') so the full linked Budget document
 *   is embedded in the response instead of just the ObjectId reference.
 *
 * Route  : GET /api/anomaly/all
 * Access : Public
 */
const getAllAnomalies = asyncHandler(async (req, res) => {
    // populate('budget_id') replaces the ObjectId with the actual Budget document
    const anomalies = await Anomaly.find()
        .populate("budget_id")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, anomalies, "Anomalies fetched successfully"));
});


/*
 * getHighSeverity
 * ---------------
 * What it does:
 *   Fetches only Anomaly documents where severity === 'HIGH'.
 *   This is the critical alert feed — used by dashboards to highlight
 *   departments or districts with serious spending irregularities.
 *   Also populates the linked Budget document for full context.
 *
 * Route  : GET /api/anomaly/high
 * Access : Public
 */
const getHighSeverity = asyncHandler(async (req, res) => {
    // Filter strictly to HIGH severity — LOW and MEDIUM are excluded
    const anomalies = await Anomaly.find({ severity: "HIGH" })
        .populate("budget_id")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, anomalies, "High severity anomalies fetched successfully"));
});


/*
 * getAnomalyByDepartment
 * ----------------------
 * What it does:
 *   Fetches all Anomaly documents for a specific department,
 *   identified by the department name in the URL parameter (:dept).
 *   Useful for department-level audit views.
 *   Returns 404 if the department has no anomaly records at all.
 *
 * Route  : GET /api/anomaly/department/:dept
 * Access : Public
 */
const getAnomalyByDepartment = asyncHandler(async (req, res) => {
    const anomalies = await Anomaly.find({ department: req.params.dept })
        .populate("budget_id")
        .sort({ createdAt: -1 });

    // If no records found, the department name might be wrong or has no data yet
    if (!anomalies.length) {
        throw new ApiError(404, `No anomalies found for department: ${req.params.dept}`);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, anomalies, "Anomalies fetched successfully"));
});


export {
    getAllAnomalies,
    getHighSeverity,
    getAnomalyByDepartment,
};