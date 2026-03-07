import Prediction from "../models/prediction.js";
import Budget from "../models/budget.js";
import { suggestReallocation } from "../services/aiService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const runPrediction = asyncHandler(async (req, res) => {
    const {
        department,
        state,
        district,
        financial_year,
        allocated_amount,
        spent_amount,
        current_spent,
    } = req.body;

    if (!department || !district || !financial_year || allocated_amount === undefined) {
        throw new ApiError(400, "Missing required fields: department, district, financial_year, allocated_amount");
    }

    const allocNum = parseFloat(allocated_amount);
    const spentNum = parseFloat(spent_amount ?? current_spent ?? 0);

    if (isNaN(allocNum) || allocNum <= 0) {
        throw new ApiError(400, "allocated_amount must be a positive number");
    }
    if (isNaN(spentNum) || spentNum < 0) {
        throw new ApiError(400, "spent_amount must be a non-negative number");
    }

    // ── Lapse prediction logic ────────────────────────────
    const currentMonth    = new Date().getMonth() + 1; // 1–12
    const monthsElapsed   = Math.max(currentMonth, 1);
    const monthlyAvg      = spentNum / monthsElapsed;
    const remainingMonths = 12 - monthsElapsed;

    // Project to year end
    const projectedFinal  = spentNum + (monthlyAvg * remainingMonths);
    const projected       = parseFloat(Math.min(projectedFinal, allocNum).toFixed(2));
    const predictedUnused = parseFloat(Math.max(0, allocNum - projected).toFixed(2));
    const lapsePct        = parseFloat(((predictedUnused / allocNum) * 100).toFixed(1));
    const utilization     = parseFloat(((spentNum / allocNum) * 100).toFixed(1));

    // ── Risk level ────────────────────────────────────────
    const risk_level =
        lapsePct >= 60 ? "CRITICAL" :
        lapsePct >= 40 ? "HIGH"     :
        lapsePct >= 20 ? "MEDIUM"   : "LOW";

    // ── Reallocation suggestion ───────────────────────────
    const reallocation_suggestion =
        risk_level === "CRITICAL"
            ? `${department} is projected to leave ₹${predictedUnused} Cr unused (${lapsePct}% lapse risk). Fast-track pending approvals or reallocate to high-demand departments immediately.`
        : risk_level === "HIGH"
            ? `${department} has high lapse risk with ₹${predictedUnused} Cr at stake. Review spending pace and escalate to department head.`
        : risk_level === "MEDIUM"
            ? `${department} showing moderate lapse risk of ₹${predictedUnused} Cr. Monitor monthly targets and accelerate Q4 spending.`
            : `${department} spending is on track with ${utilization}% utilization. Continue monitoring.`;

    // ── Save to DB ────────────────────────────────────────
    const prediction = new Prediction({
        department,
        state:                   state || "",
        district,
        financial_year,
        allocated_amount:        allocNum,
        projected_spending:      projected,
        predicted_unused:        predictedUnused,
        risk_level,
        reallocation_suggestion,
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
    const predictions = await Prediction.find({
        risk_level: { $in: ["HIGH", "CRITICAL"] }
    }).sort({ createdAt: -1 });
    return res
        .status(200)
        .json(new ApiResponse(200, predictions, "High risk predictions fetched successfully"));
});

const getReallocationSuggestions = asyncHandler(async (req, res) => {
    const lowUtilBudgets = await Budget.find({
        utilization_percentage: { $lt: 30 }
    }).sort({ createdAt: -1 });

    if (!lowUtilBudgets.length) {
        return res
            .status(200)
            .json(new ApiResponse(200, { suggestions: [] }, "No low utilization departments found"));
    }

    const departments = lowUtilBudgets.map(b => ({
        department:             b.department,
        state:                  b.state,
        district:               b.district,
        financial_year:         b.financial_year,
        allocated_amount:       b.allocated_amount,
        spent_amount:           b.spent_amount,
        utilization_percentage: b.utilization_percentage,
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