import scenario, { setup as setupScenario } from './scenario.js';
export { aiAnalyzeLatency, aiReallocationLatency, dbQueryLatency, errorRate, timeoutRate } from './scenario.js';

export const options = {
    vus: 10,
    duration: '1m',
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
        'error_rate': ['rate<0.01'],      // Less than 1% errors
        'timeout_rate': ['rate<0.01']     // Less than 1% timeouts from AI service
    },
};

export function setup() {
    return setupScenario();
}

export default function (data) {
    scenario(data);
}
