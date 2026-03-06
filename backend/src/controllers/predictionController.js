import Prediction from "../models/prediction.js";
import Budget from "../models/budget.js";
import { predictUtilization, suggestReallocation } from "../services/aiService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const runPrediction = asyncHandler(async (req, res) => {
    const { department, district, financial_year, allocated_amount, current_spent, month } = req.body;

    if (!department || !district || !financial_year || allocated_amount === undefined) {
        throw new ApiError(400, "Missing required fields: department, district, financial_year, allocated_amount");
    }

    const predictionResult = await predictUtilization({
        department,
        district,
        financial_year,
        allocated_amount,
        current_spent: current_spent || 0,
        month: month || "January"
    });

    const prediction = new Prediction({
        department,
        district,
        financial_year,
        allocated_amount,
        projected_spending:      predictionResult.projected_spending,
        predicted_unused:        predictionResult.predicted_unused,
        risk_level:              predictionResult.risk_level,
        reallocation_suggestion: predictionResult.reallocation_suggestion,
    });
    await prediction.save();

    return res
        .status(201)
        .json(new ApiResponse(201, prediction, "Prediction generated successfully"));
});

const getAllPredictions = asyncHandler(async (req, res) => {
    const predictions = await Prediction.find().sort({ createdAt: -1 });
    return res
        .status(200)
        .json(new ApiResponse(200, predictions, "Predictions fetched successfully"));
});

const getHighRisk = asyncHandler(async (req, res) => {
    const predictions = await Prediction.find({ risk_level: "HIGH" }).sort({ createdAt: -1 });
    return res
        .status(200)
        .json(new ApiResponse(200, predictions, "High risk predictions fetched successfully"));
});

const getReallocationSuggestions = asyncHandler(async (req, res) => {
    // Get all budgets with less than 30% utilization
    const lowUtilBudgets = await Budget.find({
        utilization_percentage: { $lt: 30 }
    }).sort({ createdAt: -1 });

    if (!lowUtilBudgets.length) {
        return res
            .status(200)
            .json(new ApiResponse(200, { suggestions: [] }, "No low utilization departments found"));
    }

    const departments = lowUtilBudgets.map(b => ({
        department: b.department,
        state: b.state,
        district: b.district,
        financial_year: b.financial_year,
        allocated_amount: b.allocated_amount,
        spent_amount: b.spent_amount,
        utilization_percentage: b.utilization_percentage
    }));

    const result = await suggestReallocation(departments);

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Reallocation suggestions generated successfully"));
});

export {
    runPrediction,
    getAllPredictions,
    getHighRisk,
    getReallocationSuggestions,
};