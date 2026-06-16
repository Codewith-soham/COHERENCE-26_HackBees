import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

// Custom metrics for AI service and Database validation
export const aiAnalyzeLatency = new Trend('ai_analyze_latency');
export const aiReallocationLatency = new Trend('ai_reallocation_latency');
export const dbQueryLatency = new Trend('db_query_latency');
export const errorRate = new Rate('error_rate');
export const timeoutRate = new Rate('timeout_rate');

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000/api';
const ADMIN_EMAIL = __ENV.ADMIN_EMAIL || 'admin@gov.in';
const ADMIN_PASSWORD = __ENV.ADMIN_PASSWORD || 'securepassword';

export function setup() {
    // 1. Login to get JWT
    const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
    }), {
        headers: { 'Content-Type': 'application/json' },
    });

    if (loginRes.status !== 200) {
        console.error('Login failed in setup. Ensure test user exists or check credentials.');
        return { token: '' };
    }

    const token = loginRes.json('data.token');
    return { token };
}

export default function (data) {
    // If setup failed, don't execute tests
    if (!data.token) {
        sleep(1);
        return;
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.token}`,
    };

    // 1. GET /api/budget/all (DB Pagination + Lean Validation)
    const budgetStart = new Date();
    const budgetRes = http.get(`${BASE_URL}/budget/all?page=1&limit=20`, { headers });
    const budgetLatency = new Date() - budgetStart;
    
    check(budgetRes, {
        'budget fetch status is 200': (r) => r.status === 200,
        'budget pagination metadata exists': (r) => r.json('page') !== undefined,
    }) || errorRate.add(1);
    dbQueryLatency.add(budgetLatency);

    // 2. GET /api/anomaly/all (DB Populate + Index Validation)
    const anomalyStart = new Date();
    const anomalyRes = http.get(`${BASE_URL}/anomaly/all?page=1&limit=20`, { headers });
    const anomalyLatency = new Date() - anomalyStart;
    
    check(anomalyRes, {
        'anomaly fetch status is 200': (r) => r.status === 200,
    }) || errorRate.add(1);
    dbQueryLatency.add(anomalyLatency);

    // 3. GET /api/prediction/all (DB Query Validation)
    const predRes = http.get(`${BASE_URL}/prediction/all?page=1&limit=20`, { headers });
    check(predRes, {
        'prediction fetch status is 200': (r) => r.status === 200,
    }) || errorRate.add(1);

    // 4. POST /api/prediction/reallocation (AI Service Compute + DB aggregation)
    const reallocStart = new Date();
    const reallocRes = http.post(`${BASE_URL}/prediction/reallocation`, null, { headers });
    const reallocLatency = new Date() - reallocStart;
    
    const reallocSuccess = check(reallocRes, {
        'reallocation status is 200': (r) => r.status === 200,
    });
    
    if (!reallocSuccess) errorRate.add(1);
    if (reallocLatency > 5000 || reallocRes.status === 504) timeoutRate.add(1);
    aiReallocationLatency.add(reallocLatency);

    // 5. POST /api/budget/analyze (AI Service Request + DB Write)
    const payload = JSON.stringify({
        department: "Health",
        state: "Maharashtra",
        district: "Pune",
        month: "June",
        financial_year: "2025-26",
        allocated_amount: 100,
        spent_amount: Math.floor(Math.random() * 50) + 10,
    });

    const analyzeStart = new Date();
    const analyzeRes = http.post(`${BASE_URL}/budget/analyze`, payload, { headers });
    const analyzeLatency = new Date() - analyzeStart;

    const analyzeSuccess = check(analyzeRes, {
        'analyze status is 201': (r) => r.status === 201,
    });
    
    if (!analyzeSuccess) errorRate.add(1);
    if (analyzeLatency > 5000 || analyzeRes.status === 504) timeoutRate.add(1);
    aiAnalyzeLatency.add(analyzeLatency);

    // Simulate think time between user actions
    sleep(1);
}
