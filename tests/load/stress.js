import scenario, { setup as setupScenario } from './scenario.js';
export { aiAnalyzeLatency, aiReallocationLatency, dbQueryLatency, errorRate, timeoutRate } from './scenario.js';

export const options = {
    stages: [
        { duration: '1m', target: 100 },  // fast ramp to 100
        { duration: '2m', target: 300 },  // push to 300
        { duration: '2m', target: 500 },  // extreme push to 500 users
        { duration: '1m', target: 0 },    // cooldown
    ],
    thresholds: {
        // Stress tests are meant to find breaking points.
        // We set relaxed thresholds just to measure degradation.
        http_req_duration: ['p(95)<3000'], 
        'error_rate': ['rate<0.15'], // Up to 15% errors acceptable in extreme stress
    },
};

export function setup() {
    return setupScenario();
}

export default function (data) {
    scenario(data);
}
