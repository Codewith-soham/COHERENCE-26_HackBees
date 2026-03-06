/*
 * ============================================================
 *  BUDGET CONTROLLER
 *  Handles all budget-related operations:
 *  - Analyze a new budget entry (save to DB + run AI anomaly check)
 *  - Fetch all budgets
 *  - Fetch a single budget by its MongoDB ID
 *  - Fetch budgets filtered by department name
 *  - Fetch budgets filtered by district name
 * ============================================================
 */

import Budget from "../models/budget.js";
import Anomaly from "../models/anomaly.js";
import { checkAnomaly } from "../services/aiService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


/*
 * analyzeBudget
 * -------------
 * What it does:
 *   1. Reads budget fields from req.body
 *   2. Validates that all required fields are present
 *   3. Saves a new Budget document to MongoDB
 *      (utilization_percentage is auto-calculated by the pre-save hook)
 *   4. Sends the saved budget data to the Python AI service
 *      to check for spending anomalies
 *   5. Saves the anomaly result as a linked Anomaly document in MongoDB
 *   6. Returns both the budget and anomaly in the response
 *
 * Route  : POST /api/budget/analyze
 * Access : Public
 */
const analyzeBudget = asyncHandler(async (req, res) => {
    const {
        department,
        district,
        month,
        financial_year,
        allocated_amount,
        spent_amount,
    } = req.body;

    // Guard: all six fields are mandatory — reject early if any is missing
    if (
        !department ||
        !district ||
        !month ||
        !financial_year ||
        allocated_amount === undefined ||
        spent_amount === undefined
    ) {
        throw new ApiError(
            400,
            "Missing required fields: department, district, month, financial_year, allocated_amount, spent_amount"
        );
    }

    // Create and persist the Budget document
    // The pre-save hook on Budget model will compute utilization_percentage automatically
    const budget = new Budget({
        department,
        district,
        month,
        financial_year,
        allocated_amount,
        spent_amount,
    });
    await budget.save();

    // Ask the AI service to analyze this budget for anomalies
    // checkAnomaly() handles AI-offline scenarios gracefully — never throws
    const anomalyResult = await checkAnomaly({
        department,
        district,
        month,
        financial_year,
        allocated_amount,
        spent_amount,
        utilization_percentage: budget.utilization_percentage,
    });

    // Save the anomaly result, linked to the budget we just created
    const anomaly = new Anomaly({
        budget_id:        budget._id,
        department,
        district,
        anomaly_detected: anomalyResult.anomaly_detected,
        anomaly_score:    anomalyResult.anomaly_score,
        explanation:      anomalyResult.explanation,
        severity:         anomalyResult.severity,
    });
    await anomaly.save();

    // Return both documents so the frontend gets the full picture in one call
    return res
        .status(201)
        .json(new ApiResponse(201, { budget, anomaly }, "Budget analyzed successfully"));
});


/*
 * getAllBudgets
 * ------------
 * What it does:
 *   Fetches every Budget document stored in MongoDB,
 *   sorted by newest first (createdAt descending).
 *
 * Route  : GET /api/budget/all
 * Access : Public
 */
const getAllBudgets = asyncHandler(async (req, res) => {
    const budgets = await Budget.find().sort({ createdAt: -1 });
    return res
        .status(200)
        .json(new ApiResponse(200, budgets, "Budgets fetched successfully"));
});


/*
 * getBudgetById
 * -------------
 * What it does:
 *   Looks up a single Budget document using the MongoDB ObjectId
 *   passed as a URL parameter (:id).
 *   Returns 404 if no matching document is found.
 *
 * Route  : GET /api/budget/:id
 * Access : Public
 */
const getBudgetById = asyncHandler(async (req, res) => {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
        throw new ApiError(404, "Budget not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, budget, "Budget fetched successfully"));
});


/*
 * getBudgetByDepartment
 * ---------------------
 * What it does:
 *   Fetches all Budget documents where the department field matches
 *   the department name passed as a URL parameter (:dept).
 *   Returns 404 if no budgets exist for that department.
 *
 * Route  : GET /api/budget/department/:dept
 * Access : Public
 */
const getBudgetByDepartment = asyncHandler(async (req, res) => {
    const budgets = await Budget.find({ department: req.params.dept }).sort({ createdAt: -1 });

    if (!budgets.length) {
        throw new ApiError(404, `No budgets found for department: ${req.params.dept}`);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, budgets, "Budgets fetched successfully"));
});


/*
 * getBudgetByDistrict
 * -------------------
 * What it does:
 *   Fetches all Budget documents where the district field matches
 *   the district name passed as a URL parameter (:dist).
 *   Returns 404 if no budgets exist for that district.
 *
 * Route  : GET /api/budget/district/:dist
 * Access : Public
 */
const getBudgetByDistrict = asyncHandler(async (req, res) => {
    const budgets = await Budget.find({ district: req.params.dist }).sort({ createdAt: -1 });

    if (!budgets.length) {
        throw new ApiError(404, `No budgets found for district: ${req.params.dist}`);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, budgets, "Budgets fetched successfully"));
});


export {
    analyzeBudget,
    getAllBudgets,
    getBudgetById,
    getBudgetByDepartment,
    getBudgetByDistrict,
};