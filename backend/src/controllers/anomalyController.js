import Anomaly from "../models/anomaly.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getAllAnomalies = asyncHandler(async (req, res) => {
    const anomalies = await Anomaly.find()
        .populate("budget_id")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, anomalies, "Anomalies fetched successfully"));
});

const getHighSeverity = asyncHandler(async (req, res) => {
    const anomalies = await Anomaly.find({ severity: "HIGH" })
        .populate("budget_id")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, anomalies, "High severity anomalies fetched successfully"));
});

const getAnomalyByDepartment = asyncHandler(async (req, res) => {
    const anomalies = await Anomaly.find({ department: req.params.dept })
        .populate("budget_id")
        .sort({ createdAt: -1 });

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