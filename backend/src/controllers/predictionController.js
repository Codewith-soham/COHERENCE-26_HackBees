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
        spent_amount,      // ← accept spent_amount
        current_spent,     // ← also accept current_spent (legacy)
    } = req.body;

    if (!department || !district || !financial_year || allocated_amount === undefined) {
        throw new ApiError(400, "Missing required fields: department, district, financial_year, allocated_amount");
    }

    const allocNum = parseFloat(allocated_amount);
    const spentNum = parseFloat(spent_amount ?? current_spent ?? 0);

    // ── Self-contained lapse prediction (no AI dependency) ──
    const currentMonth = new Date().getMonth() + 1; // 1–12
    const utilization  = (spentNum / allocNum) * 100;

    // Project spending to year-end based on current month
    const monthsElapsed   = Math.max(currentMonth, 1);
    const projectedFinal  = (spentNum / monthsElapsed) * 12;
    const projected       = Math.min(projectedFinal, allocNum); // cap at allocated
    const predictedUnused = Math.max(0, allocNum - projected);
    const lapsePct        = (predictedUnused / allocNum) * 100;

    const risk_level =
        lapsePct >= 60 ? "CRITICAL" :
        lapsePct >= 40 ? "HIGH"     :
        lapsePct >= 20 ? "MEDIUM"   : "LOW";

    const reallocation_suggestion =
        risk_level === "CRITICAL"
            ? `${department} is projected to leave ₹${predictedUnused.toFixed(1)} Cr unused (${lapsePct.toFixed(1)}% lapse risk). Fast-track pending approvals or reallocate to high-demand departments immediately.`
        : risk_level === "HIGH"
            ? `${department} has high lapse risk with ₹${predictedUnused.toFixed(1)} Cr at stake. Review spending pace and escalate to department head.`
        : risk_level === "MEDIUM"
            ? `${department} showing moderate lapse risk. Monitor monthly targets closely and accelerate Q4 spending.`
            : `${department} spending is on track. Continue monitoring utilization.`;

    const prediction = new Prediction({
        department,
        state:                   state || "",
        district,
        financial_year,
        allocated_amount:        allocNum,
        projected_spending:      parseFloat(projected.toFixed(2)),
        predicted_unused:        parseFloat(predictedUnused.toFixed(2)),
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
        risk_level: { $in: ["HIGH", "CRITICAL"] }   // ← was only "HIGH", now catches CRITICAL too
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