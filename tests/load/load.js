import scenario, { setup as setupScenario } from './scenario.js';
export { aiAnalyzeLatency, aiReallocationLatency, dbQueryLatency, errorRate, timeoutRate } from './scenario.js';

export const options = {
    stages: [
        { duration: '30s', target: 50 },  // ramp up to 50 users
        { duration: '2m', target: 100 },  // ramp up to 100 users and hold
        { duration: '30s', target: 0 },   // ramp down to 0
    ],
    thresholds: {
        http_req_duration: ['p(95)<1000'], // 95% of requests must complete below 1s
        'error_rate': ['rate<0.05'],       // Acceptable error rate under load < 5%
        'ai_analyze_latency': ['p(95)<2500'], // AI analysis must complete within 2.5s
    },
};

export function setup() {
    return setupScenario();
}

export default function (data) {
    scenario(data);
}
