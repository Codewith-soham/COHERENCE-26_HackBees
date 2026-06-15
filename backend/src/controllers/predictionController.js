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
    if (spentNum > allocNum) {
        throw new ApiError(400, "spent_amount cannot exceed allocated_amount");
    }

    // ── Indian FY starts April (calendar month 4) ─────────
    const calMonth      = new Date().getMonth() + 1;       // 1–12
    const monthsElapsed = calMonth >= 4
        ? calMonth - 3          // Apr=1, May=2 … Mar=12
        : calMonth + 9;         // Jan=10, Feb=11, Mar=12
    const remainingMonths = Math.max(12 - monthsElapsed, 0);

    // ── Project spend to year end ─────────────────────────
    const monthlyAvg     = monthsElapsed > 0 ? spentNum / monthsElapsed : 0;
    const projectedFinal = spentNum + (monthlyAvg * remainingMonths);
    const projected      = parseFloat(Math.min(projectedFinal, allocNum).toFixed(2));

    // ── Key metrics ───────────────────────────────────────
    const predictedUnused = parseFloat(Math.max(0, allocNum - projected).toFixed(2));
    const lapsePct        = parseFloat(((predictedUnused / allocNum) * 100).toFixed(1));
    const utilization     = parseFloat(((spentNum / allocNum) * 100).toFixed(1));

    // ── Risk level based on PROJECTED utilization ─────────
    // High unused funds = high risk of lapse
    // LOW risk    → department is spending well (projected util >= 90%)
    // MEDIUM risk → some funds likely unused    (projected util 70–89%)
    // HIGH risk   → significant lapse expected  (projected util 50–69%)
    // CRITICAL    → major lapse, needs action   (projected util < 50%)
    const projectedUtil = parseFloat(((projected / allocNum) * 100).toFixed(1));

    const risk_level =
        projectedUtil >= 90 ? "LOW"      :
        projectedUtil >= 70 ? "MEDIUM"   :
        projectedUtil >= 50 ? "HIGH"     : "CRITICAL";

    // ── Reallocation suggestion ───────────────────────────
    const reallocation_suggestion =
        risk_level === "CRITICAL"
            ? `CRITICAL: ${department} has only utilized ${utilization}% so far and is projected to leave ₹${predictedUnused} Cr (${lapsePct}%) unused by year-end. Immediate reallocation to high-demand departments or fast-track approval of pending projects is required.`
        : risk_level === "HIGH"
            ? `HIGH RISK: ${department} is projected to leave ₹${predictedUnused} Cr unused (${lapsePct}% lapse). Current utilization is ${utilization}%. Escalate to department head and review pending spending approvals before Q4.`
        : risk_level === "MEDIUM"
            ? `MODERATE RISK: ${department} showing ${utilization}% utilization with ₹${predictedUnused} Cr at risk of lapse. Monitor monthly spending targets and accelerate planned procurement in remaining months.`
            : `ON TRACK: ${department} is performing well with ${utilization}% current utilization. Projected to utilize ${projectedUtil}% by year-end. Continue monitoring to maintain spending pace.`;

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
    // Find budgets with utilization below 50% — these are genuinely at risk
    const lowUtilBudgets = await Budget.find({
        utilization_percentage: { $lt: 50 }
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