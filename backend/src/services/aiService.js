/*
 * ============================================================
 *  AI SERVICE
 *  Provides communication layer between Node.js backend and
 *  Python FastAPI AI service running on port 8000.
 *
 *  PRODUCTION BEHAVIOR:
 *  - All requests have a 5-second timeout via AbortController.
 *  - If the AI service hangs or is unreachable, graceful
 *    fallback responses are returned.
 *  - The backend never crashes due to AI service failures.
 * ============================================================
 */

import config from '../config/index.js';

const AI_BASE_URL = config.AI_SERVICE_URL;
const AI_TIMEOUT_MS = 5000; // 5 second timeout

/**
 * Create a fetch request with an AbortController timeout.
 * Returns the Response object or throws on timeout/network error.
 */
const fetchWithTimeout = async (url, options = {}) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        return response;
    } finally {
        clearTimeout(timeoutId);
    }
};

// ── Health Check ─────────────────────────────────────────────
export const checkAIHealth = async () => {
    try {
        const response = await fetchWithTimeout(`${AI_BASE_URL}/ai/health`);
        const result = await response.json();
        return result.status === 'ok' || result.status === 'running';
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('AI Health check timed out after 5s');
        }
        return false;
    }
};

// ── Anomaly Check ─────────────────────────────────────────────
export const checkAnomaly = async (budgetData) => {
    try {
        const response = await fetchWithTimeout(`${AI_BASE_URL}/ai/anomaly-check`, {
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
            anomaly_score:    result.anomaly_score    ?? 0,
            explanation:      result.explanation      ?? 'Analysis completed',
            severity:         result.severity         ?? 'LOW',
        };
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('AI anomaly-check timed out after 5s — returning fallback');
        } else {
            console.error('AI Service unavailable:', error.message);
        }
        return getDefaultAnomalyResult();
    }
};

// ── Predict Utilization ───────────────────────────────────────
export const predictUtilization = async (predictionData) => {
    try {
        const response = await fetchWithTimeout(`${AI_BASE_URL}/ai/predict-utilization`, {
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
            projected_spending:      result.projected_spending      ?? predictionData.allocated_amount * 0.75,
            predicted_unused:        result.predicted_unused        ?? predictionData.allocated_amount * 0.25,
            risk_level:              result.risk_level              ?? 'MEDIUM',
            reallocation_suggestion: result.reallocation_suggestion ?? null,
        };
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('AI predict-utilization timed out after 5s — returning fallback');
        } else {
            console.error('AI Service unavailable:', error.message);
        }
        return getDefaultPredictionResult(predictionData.allocated_amount);
    }
};

// ── Suggest Reallocation ──────────────────────────────────────
export const suggestReallocation = async (departments) => {
    try {
        // Map Node field names → Python Pydantic model field names
        const mapped = departments.map((d, i) => ({
            department_id:    String(i + 1),
            department_name:  d.department,
            allocated:        d.allocated_amount,
            spent:            d.spent_amount,
            utilization_rate: d.utilization_percentage,
            priority_score:   getPriorityScore(d.department),
            demand_indicator: d.utilization_percentage < 30 ? 0.2 : 0.7,
        }));

        const response = await fetchWithTimeout(`${AI_BASE_URL}/ai/suggest-reallocation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ departments: mapped }),
        });

        if (!response.ok) throw new Error(`AI error: ${response.status}`);

        const text = await response.text();   // read as text first
        const data = JSON.parse(text);        // then parse safely

        const suggestions = (data.suggestions || []).map(s => ({
            source_department:      s.from_department,
            destination_department: s.to_department,
            amount_to_reallocate:   s.transfer_amount,
            reason:                 s.reason,
            priority: s.impact_score >= 0.7 ? 'HIGH' : s.impact_score >= 0.4 ? 'MEDIUM' : 'LOW',
        }));

        return {
            suggestions,
            total_reallocatable:      data.total_reallocatable      ?? 0,
            before_avg_utilization:   data.before_avg_utilization   ?? 0,
            after_avg_utilization:    data.after_avg_utilization    ?? 0,
            summary:                  data.summary                  ?? '',
        };

    } catch (error) {
        if (error.name === 'AbortError') {
            console.warn('AI reallocation timed out after 5s, using local logic');
        } else {
            console.warn('AI reallocation failed, using local logic:', error.message);
        }

        // ── Local fallback — always returns useful data ───────
        const suggestions = departments.map(d => {
            const unused          = d.allocated_amount - d.spent_amount;
            const transferAmount  = parseFloat((unused * 0.6).toFixed(2));
            const priority        =
                d.utilization_percentage < 10 ? 'HIGH'   :
                d.utilization_percentage < 20 ? 'MEDIUM' : 'LOW';

            return {
                source_department:      d.department,
                destination_department: getNeedy(d.department),
                amount_to_reallocate:   transferAmount,
                reason: `${d.department} has only ${d.utilization_percentage.toFixed(1)}% utilization with ₹${unused.toFixed(1)} Cr unused. Recommending ₹${transferAmount} Cr reallocation to ${getNeedy(d.department)}.`,
                priority,
                state:          d.state,
                district:       d.district,
                financial_year: d.financial_year,
            };
        });

        const totalReallocatable = suggestions.reduce((s, r) => s + r.amount_to_reallocate, 0);

        return {
            suggestions,
            total_reallocatable:    parseFloat(totalReallocatable.toFixed(2)),
            before_avg_utilization: parseFloat(
                (departments.reduce((s, d) => s + d.utilization_percentage, 0) / departments.length).toFixed(2)
            ),
            after_avg_utilization:  0,
            summary: `${suggestions.length} reallocation(s) suggested. ₹${totalReallocatable.toFixed(1)} Cr can be redistributed.`,
        };
    }
};

// ── Helpers ───────────────────────────────────────────────────

/**
 * Priority score for each department (used by Python AI model).
 * Higher = more critical need for funds.
 */
const getPriorityScore = (dept) => {
    const scores = {
        'Health':          9,
        'Education':       8,
        'Water Resources': 8,
        'Agriculture':     7,
        'Infrastructure':  7,
        'Housing':         6,
        'Transport':       6,
        'Energy':          5,
        'Finance':         4,
        'Defence':         4,
    };
    return scores[dept] || 5;
};

/**
 * Maps a low-utilization (donor) department to a high-need (receiver) department.
 */
const getNeedy = (sourceDept) => {
    const map = {
        'Infrastructure':  'Health',
        'Agriculture':     'Education',
        'Transport':       'Water Resources',
        'Housing':         'Health',
        'Energy':          'Education',
        'Finance':         'Infrastructure',
        'Defence':         'Health',
        'Health':          'Education',
        'Education':       'Water Resources',
        'Water Resources': 'Agriculture',
    };
    return map[sourceDept] || 'Health';
};

// ── Default fallbacks ─────────────────────────────────────────
const getDefaultAnomalyResult = () => ({
    anomaly_detected: false,
    anomaly_score:    0,
    explanation:      'AI service unavailable - manual review recommended',
    severity:         'LOW',
});

const getDefaultPredictionResult = (allocatedAmount) => ({
    projected_spending:      allocatedAmount * 0.75,
    predicted_unused:        allocatedAmount * 0.25,
    risk_level:              'MEDIUM',
    reallocation_suggestion: null,
});