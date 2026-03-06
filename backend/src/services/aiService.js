/*
 * ============================================================
 *  AI SERVICE
 *  Provides communication layer between Node.js backend and
 *  Python FastAPI AI service running on port 8000.
 * ============================================================
 */
const AI_BASE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export const checkAIHealth = async () => {
    try {
        const response = await fetch(`${AI_BASE_URL}/ai/health`);
        const result = await response.json();
        return result.status === 'ok' || result.status === 'running';
    } catch (error) {
        return false;
    }
};

export const checkAnomaly = async (budgetData) => {
    try {
        const response = await fetch(`${AI_BASE_URL}/ai/anomaly-check`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(budgetData),
        });
        if (!response.ok) {
            console.error(`AI Service error: ${response.status}`);
            return getDefaultAnomalyResult();
        }
        const result = await response.json();
        return {
            anomaly_detected: result.anomaly_detected ?? false,
            anomaly_score: result.anomaly_score ?? 0,
            explanation: result.explanation ?? 'Analysis completed',
            severity: result.severity ?? 'LOW',
        };
    } catch (error) {
        console.error('AI Service unavailable:', error.message);
        return getDefaultAnomalyResult();
    }
};

export const predictUtilization = async (predictionData) => {
    try {
        const response = await fetch(`${AI_BASE_URL}/ai/predict-utilization`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(predictionData),
        });
        if (!response.ok) {
            console.error(`AI Service error: ${response.status}`);
            return getDefaultPredictionResult(predictionData.allocated_amount);
        }
        const result = await response.json();
        return {
            projected_spending: result.projected_spending ?? predictionData.allocated_amount * 0.75,
            predicted_unused: result.predicted_unused ?? predictionData.allocated_amount * 0.25,
            risk_level: result.risk_level ?? 'MEDIUM',
            reallocation_suggestion: result.reallocation_suggestion ?? null,
        };
    } catch (error) {
        console.error('AI Service unavailable:', error.message);
        return getDefaultPredictionResult(predictionData.allocated_amount);
    }
};

export const suggestReallocation = async (departments) => {
    try {
        const mapped = departments.map(d => ({
            department: d.department,
            state: d.state,
            district: d.district,
            financial_year: d.financial_year,
            allocated_amount: d.allocated_amount,
            spent_amount: d.spent_amount,
            utilization_percentage: d.utilization_percentage
        }));

        const response = await fetch(`${AI_BASE_URL}/ai/suggest-reallocation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ departments: mapped }),
        });

        if (!response.ok) {
            console.error(`AI Reallocation Service error: ${response.status}`);
            return { suggestions: [] };
        }

        const data = await response.json();
        const suggestions = (data.suggestions || []).map(s => ({
            source_department: s.from_department,
            destination_department: s.to_department,
            amount_to_reallocate: s.transfer_amount,
            reason: s.reason,
            priority: s.impact_score >= 0.7 ? 'HIGH' : s.impact_score >= 0.4 ? 'MEDIUM' : 'LOW'
        }));

        return { suggestions };

    } catch (error) {
        console.error('AI Reallocation Service unavailable:', error.message);
        return { suggestions: [] };
    }
};

const getDefaultAnomalyResult = () => ({
    anomaly_detected: false,
    anomaly_score: 0,
    explanation: 'AI service unavailable - manual review recommended',
    severity: 'LOW',
});

const getDefaultPredictionResult = (allocatedAmount) => ({
    projected_spending: allocatedAmount * 0.75,
    predicted_unused: allocatedAmount * 0.25,
    risk_level: 'MEDIUM',
    reallocation_suggestion: null,
});