# Load Testing & Production Validation

This document outlines the performance testing strategy for BudgetGuard AI before public deployment.

## Testing Tool
We use [k6](https://k6.io/) for high-concurrency API load testing.

## Files Created
- `tests/load/scenario.js`: Core authenticated test flow.
- `tests/load/smoke.js`: Smoke test configuration (10 users).
- `tests/load/load.js`: Load test configuration (100 users).
- `tests/load/stress.js`: Stress test configuration (500 users).

## Test Scenarios Executed (Authenticated Flow)
The k6 script performs the following flow continuously per virtual user:
1. **Setup Phase**: Login via `POST /api/auth/login`, extract JWT, and share it with Virtual Users.
2. **GET /api/budget/all**: Tests MongoDB `.lean()` and pagination performance.
3. **GET /api/anomaly/all**: Tests MongoDB `.populate()` and indexed sorting under load.
4. **GET /api/prediction/all**: Tests basic DB querying.
5. **POST /api/prediction/reallocation**: Tests backend aggregation + synchronous AI compute.
6. **POST /api/budget/analyze**: Tests DB write + AI ML inference loop.

## Execution Commands

Ensure your backend and AI service are running (e.g., via `docker-compose up -d`).
You must have a valid admin user in the database. Provide credentials via environment variables.

### 1. Smoke Test (10 users)
Verifies basic functionality and environment correctness.
```bash
k6 run -e ADMIN_EMAIL=admin@gov.in -e ADMIN_PASSWORD=securepassword tests/load/smoke.js
```

### 2. Load Test (100 users)
Verifies expected production capacity and service level agreements (SLAs).
```bash
k6 run -e ADMIN_EMAIL=admin@gov.in -e ADMIN_PASSWORD=securepassword tests/load/load.js
```

### 3. Stress Test (500 users)
Finds the breaking point. Tests the Node.js event loop and the `AbortController` fallback mechanisms when the AI service gets overloaded.
```bash
k6 run -e ADMIN_EMAIL=admin@gov.in -e ADMIN_PASSWORD=securepassword tests/load/stress.js
```

## Success Thresholds & Expected Results

### AI Service Metrics
- **Average Latency**: ~150-300ms
- **P95 Latency**: < 2.5s (Enforced in Load Test)
- **P99 Latency**: < 4.5s
- **Timeout Rate**: < 1% under normal load. (During stress tests, we *expect* timeouts. The test verifies that the backend catches these and returns fallbacks without crashing).

### Database Validation Metrics
- **Query Latency (db_query_latency)**: Should be < 50ms due to newly added indexes and `.lean()` pagination.
- **Index Usage**: Verified implicitly by the ability to handle 100+ concurrent pagination queries without MongoDB CPU spiking.

### Overall API Thresholds
- **Smoke Test Pass Criteria**: 99% success rate, p95 < 500ms.
- **Load Test Pass Criteria**: 95% success rate, p95 < 1000ms.

## Capacity Estimates
Based on current architecture (1 Node.js replica, 1 FastAPI replica with 4 Uvicorn workers):
- **Safe Concurrency**: ~150 active concurrent requests/sec.
- **AI Bottleneck**: The AI service (specifically Isolation Forest prediction and Pickle loading) is CPU bound. If RPS exceeds 200, the AI queue will build up, triggering the 5-second backend timeout fallback.
- **Database Limits**: With `.lean()` and pagination, MongoDB can easily sustain 1000+ reads/sec. Writes (`POST /analyze`) will be the primary limiting factor for database scaling.
