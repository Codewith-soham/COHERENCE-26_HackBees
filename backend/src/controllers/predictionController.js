/*
 * ============================================================
 *  PREDICTION CONTROLLER
 *  Handles all budget utilization prediction operations:
 *  - Run a new AI prediction for a department/district/year
 *  - Fetch all stored predictions
 *  - Fetch only HIGH risk predictions (likely fund underutilization)
 * ============================================================
 */

import Prediction from "../models/Prediction.js";
import { predictUtilization } from "../services/aiService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


/*
 * runPrediction
 * -------------
 * What it does:
 *   1. Reads department, district, financial_year, allocated_amount from req.body
 *   2. Validates that all required fields are present
 *   3. Sends the data to the Python AI service to predict how much
 *      of the allocated budget will actually be spent by year end
 *   4. AI returns: projected_spending, predicted_unused, risk_level,
 *      and optionally a reallocation_suggestion
 *   5. Saves the full prediction result as a Prediction document in MongoDB
 *   6. Returns the saved prediction in the response
 *
 * Route  : POST /api/prediction/run
 * Access : Public
 */
const runPrediction = asyncHandler(async (req, res) => {
    const { department, district, financial_year, allocated_amount } = req.body;

    // Guard: all four fields are required to run a meaningful prediction
    if (!department || !district || !financial_year || allocated_amount === undefined) {
        throw new ApiError(
            400,
            "Missing required fields: department, district, financial_year, allocated_amount"
        );
    }

    // Send to AI service for utilization forecasting
    // predictUtilization() handles AI-offline scenarios gracefully — never throws
    const predictionResult = await predictUtilization({
        department,
        district,
        financial_year,
        allocated_amount,
    });

    // Persist the AI prediction result to MongoDB for future reference and analytics
    const prediction = new Prediction({
        department,
        district,
        financial_year,
        allocated_amount,
        projected_spending:      predictionResult.projected_spending,
        predicted_unused:        predictionResult.predicted_unused,
        risk_level:              predictionResult.risk_level,
        reallocation_suggestion: predictionResult.reallocation_suggestion, // optional field
    });
    await prediction.save();

    return res
        .status(201)
        .json(new ApiResponse(201, prediction, "Prediction generated successfully"));
});


/*
 * getAllPredictions
 * ----------------
 * What it does:
 *   Fetches every Prediction document stored in MongoDB,
 *   sorted by newest first (createdAt descending).
 *   Used for overview dashboards showing all forecasted utilization data.
 *
 * Route  : GET /api/prediction/all
 * Access : Public
 */
const getAllPredictions = asyncHandler(async (req, res) => {
    const predictions = await Prediction.find().sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, predictions, "Predictions fetched successfully"));
});


/*
 * getHighRisk
 * -----------
 * What it does:
 *   Fetches only Prediction documents where risk_level === 'HIGH'.
 *   These represent departments or districts predicted to significantly
 *   underutilize their allocated budget — prime candidates for fund
 *   reallocation before the financial year ends.
 *
 * Route  : GET /api/prediction/high-risk
 * Access : Public
 */
const getHighRisk = asyncHandler(async (req, res) => {
    // Filter strictly to HIGH risk — LOW and MEDIUM predictions are excluded
    const predictions = await Prediction.find({ risk_level: "HIGH" }).sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, predictions, "High risk predictions fetched successfully"));
});


export {
    runPrediction,
    getAllPredictions,
    getHighRisk,
};