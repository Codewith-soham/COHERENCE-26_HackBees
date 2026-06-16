import Anomaly from "../models/anomaly.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { parsePagination, paginatedResponse } from "../utils/pagination.js";

const getAllAnomalies = asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req);

    const [anomalies, total] = await Promise.all([
        Anomaly.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("budget_id")
            .lean(),
        Anomaly.countDocuments(),
    ]);

    return res
        .status(200)
        .json(paginatedResponse(200, anomalies, total, page, limit, "Anomalies fetched successfully"));
});

const getHighSeverity = asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req);
    const filter = { severity: "HIGH" };

    const [anomalies, total] = await Promise.all([
        Anomaly.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("budget_id")
            .lean(),
        Anomaly.countDocuments(filter),
    ]);

    return res
        .status(200)
        .json(paginatedResponse(200, anomalies, total, page, limit, "High severity anomalies fetched successfully"));
});

const getAnomalyByDepartment = asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req);
    const filter = { department: req.params.dept };

    const [anomalies, total] = await Promise.all([
        Anomaly.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("budget_id")
            .lean(),
        Anomaly.countDocuments(filter),
    ]);

    if (!anomalies.length && page === 1) {
        throw new ApiError(404, `No anomalies found for department: ${req.params.dept}`);
    }

    return res
        .status(200)
        .json(paginatedResponse(200, anomalies, total, page, limit, "Anomalies fetched successfully"));
});

export {
    getAllAnomalies,
    getHighSeverity,
    getAnomalyByDepartment,
};