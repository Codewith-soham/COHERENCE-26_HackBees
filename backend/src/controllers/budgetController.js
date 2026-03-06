import Budget from "../models/budget.js";
import Anomaly from "../models/anomaly.js";
import { checkAnomaly } from "../services/aiService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const analyzeBudget = asyncHandler(async (req, res) => {
    const {
        department,
        state,
        district,
        month,
        financial_year,
        allocated_amount,
        spent_amount,
    } = req.body;

    if (
        !department ||
        !state ||
        !district ||
        !month ||
        !financial_year ||
        allocated_amount === undefined ||
        spent_amount === undefined
    ) {
        throw new ApiError(
            400,
            "Missing required fields: department, state, district, month, financial_year, allocated_amount, spent_amount"
        );
    }

    const budget = new Budget({
        department,
        state,
        district,
        month,
        financial_year,
        allocated_amount,
        spent_amount,
    });
    await budget.save();

    const anomalyResult = await checkAnomaly({
        department,
        district,
        month,
        financial_year,
        allocated_amount,
        spent_amount,
        utilization_percentage: budget.utilization_percentage,
    });

    const anomaly = new Anomaly({
        budget_id:        budget._id,
        department,
        state,
        district,
        anomaly_detected: anomalyResult.anomaly_detected,
        anomaly_score:    anomalyResult.anomaly_score,
        explanation:      anomalyResult.explanation,
        severity:         anomalyResult.severity,
    });
    await anomaly.save();

    return res
        .status(201)
        .json(new ApiResponse(201, { budget, anomaly }, "Budget analyzed successfully"));
});

const getAllBudgets = asyncHandler(async (req, res) => {
    const budgets = await Budget.find().sort({ createdAt: -1 });
    return res
        .status(200)
        .json(new ApiResponse(200, budgets, "Budgets fetched successfully"));
});

const getBudgetById = asyncHandler(async (req, res) => {
    const budget = await Budget.findById(req.params.id);
    if (!budget) {
        throw new ApiError(404, "Budget not found");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, budget, "Budget fetched successfully"));
});

const getBudgetByDepartment = asyncHandler(async (req, res) => {
    const budgets = await Budget.find({ department: req.params.dept }).sort({ createdAt: -1 });
    if (!budgets.length) {
        throw new ApiError(404, `No budgets found for department: ${req.params.dept}`);
    }
    return res
        .status(200)
        .json(new ApiResponse(200, budgets, "Budgets fetched successfully"));
});

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