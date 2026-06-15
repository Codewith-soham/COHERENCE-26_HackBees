# BudgetSetu Frontend

Frontend client for BudgetSetu, a government budget intelligence dashboard.

This README is intentionally detailed so an AI agent (or new developer) can understand exactly how to integrate and maintain the backend APIs required by the current UI.

## 1. Stack And Runtime

- Framework: React + Vite
- Router: `react-router-dom`
- Charts: `recharts`
- Icons: `lucide-react`
- Styling: plain CSS files in `src/`

Node version recommendation:

- Node.js `>= 18`
- npm `>= 9`

## 2. Directory Map

```text
frontend/
	src/
		App.jsx                        # Route definitions
		layouts/
			AuthLayout.jsx
			DashboardLayout.jsx
		pages/
			Landing.jsx                  # Static marketing page
			Login.jsx                    # Mocked auth form (not wired yet)
			SignUp.jsx                   # Mocked signup form (not wired yet)
			Dashboard.jsx                # Uses /api/budget/all
			BudgetMonitoring.jsx         # Uses /api/budget/all
			AnomalyDetection.jsx         # Uses /api/anomaly/all
			LapsePrediction.jsx          # Uses /api/prediction/all
			Reallocation.jsx             # Uses /api/prediction/all
			BudgetPrediction.jsx         # Uses /api/prediction/all
			RealTimeEntry.jsx            # Uses POST /api/budget/analyze
			Reports.jsx                  # UI only (not wired yet)
			Settings.jsx                 # UI only (not wired yet)
```

## 3. Route To API Dependency Matrix

Current route list is defined in `src/App.jsx`.

- `/dashboard`: GET `http://localhost:5000/api/budget/all`
- `/monitoring`: GET `http://localhost:5000/api/budget/all`
- `/anomalies`: GET `http://localhost:5000/api/anomaly/all`
- `/lapse`: GET `http://localhost:5000/api/prediction/all`
- `/reallocation`: GET `http://localhost:5000/api/prediction/all`
- `/prediction`: GET `http://localhost:5000/api/prediction/all`
- `/entry`: POST `http://localhost:5000/api/budget/analyze`

Routes currently UI-only (no backend calls yet):

- `/login`
- `/signup`
- `/reports`
- `/settings`

## 4. Existing Backend Contracts (As Required By Current Code)

Important: the frontend expects responses in this wrapper shape:

```json
{
	"data": []
}
```

If your backend returns raw arrays (without `data`), UI pages will appear empty because code reads `json.data || []`.

### 4.1 GET `/api/budget/all`

Used by:

- `src/pages/Dashboard.jsx`
- `src/pages/BudgetMonitoring.jsx`

Expected item schema:

```json
{
	"state": "Maharashtra",
	"district": "Mumbai",
	"department": "Health",
	"month": "January",
	"financial_year": "2024-25",
	"allocated_amount": 500000000,
	"spent_amount": 320000000
}
```

Field rules:

- `allocated_amount` and `spent_amount` must be numeric in rupees (not crore strings).
- `month` should be full English month name (`January`, `February`, etc.) for trend chart ordering.
- `department` is used for grouping and card counts.

Used transformations in UI:

- Dashboard computes total allocated/spent/remaining and department count.
- Dashboard trend chart groups by `month` and sums `spent_amount`.
- Budget Monitoring computes utilization percentages and status tags.

### 4.2 GET `/api/anomaly/all`

Used by:

- `src/pages/AnomalyDetection.jsx`

Expected item schema:

```json
{
	"state": "Maharashtra",
	"district": "Mumbai",
	"department": "Health",
	"anomaly_detected": true,
	"anomaly_score": 0.91,
	"explanation": "Spending spike in final quarter exceeded expected variance.",
	"severity": "HIGH"
}
```

Field rules:

- `anomaly_detected` controls visibility; only `true` records are shown.
- `anomaly_score` should be `0..1`; frontend converts to `0..100`.
- `severity` should be a display-safe string (`HIGH`, `MEDIUM`, `LOW`).

### 4.3 GET `/api/prediction/all`

Used by:

- `src/pages/LapsePrediction.jsx`
- `src/pages/Reallocation.jsx`
- `src/pages/BudgetPrediction.jsx`

Expected item schema:

```json
{
	"state": "Maharashtra",
	"district": "Mumbai",
	"department": "Health",
	"financial_year": "2024-25",
	"allocated_amount": 500000000,
	"projected_spending": 390000000,
	"predicted_unused": 110000000,
	"risk_level": "HIGH",
	"reallocation_suggestion": "Reallocate unused amount to Education department for urgent needs."
}
```

Field rules:

- `risk_level` should be uppercase (`HIGH`, `MEDIUM`, `LOW`) for consistent badge mapping.
- `predicted_unused` is used directly in reallocation amount cards.
- `reallocation_suggestion` should be present for `HIGH`/`MEDIUM` if recommendations are expected.

### 4.4 POST `/api/budget/analyze`

Used by:

- `src/pages/RealTimeEntry.jsx`

Request body sent by frontend:

```json
{
	"state": "Maharashtra",
	"department": "Health",
	"district": "Mumbai",
	"month": "March",
	"financial_year": "2024-25",
	"allocated_amount": 500,
	"spent_amount": 200
}
```

Notes:

- Current form label says `Cr`, but frontend sends plain numbers as entered. Backend should decide whether to treat them as rupees/crore and normalize consistently.
- `spent_amount` may be `0` when transaction type is allocation.

Successful response expectation:

- Any `2xx` with valid JSON body.
- UI currently only checks `response.ok`; returned fields are not rendered.

Error response expectation:

```json
{
	"message": "Human-readable error"
}
```

UI shows `message` if present.

## 5. Standard Response And Error Format (Recommended)

Use a single response contract across endpoints to reduce frontend branching:

```json
{
	"success": true,
	"data": [],
	"meta": {
		"count": 0,
		"timestamp": "2026-03-07T00:00:00.000Z"
	}
}
```

Error contract:

```json
{
	"success": false,
	"message": "Validation failed",
	"errors": {
		"field": "reason"
	}
}
```

## 6. Local Development Integration

### 6.1 Start frontend

From `frontend/`:

```bash
npm install
npm run dev
```

### 6.2 Backend requirements for local run

- Backend host expected by current code: `http://localhost:5000`
- CORS must allow frontend origin (usually `http://localhost:5173` or `http://localhost:5174`)
- Content type for POST JSON: `application/json`

## 7. Recommended Cleanup For Production-Grade Integration

Current code hardcodes absolute API URLs. Recommended change:

1. Add `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

2. Add a shared API base in code:

```js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
```

3. Replace all hardcoded `fetch('http://localhost:5000/...')` with:

```js
fetch(`${API_BASE_URL}/api/budget/all`)
```

This makes environments (dev, staging, prod) configurable without code edits.

## 8. Backend Endpoints Still Needed (Planned)

These pages are currently mocked and should be wired next.

### 8.1 Auth

- POST `/api/auth/login`
- POST `/api/auth/register`
- Optional: POST `/api/auth/logout`
- Optional: GET `/api/auth/me`

Suggested payloads:

- Login request: `{ "identifier": "...", "password": "..." }`
- Register request: `{ "fullName": "...", "officerId": "...", "department": "...", "email": "...", "password": "..." }`

### 8.2 Reports

- POST `/api/reports/generate`
- GET `/api/reports/:id/download`

### 8.3 Settings/Profile

- GET `/api/user/profile`
- PUT `/api/user/profile`

## 9. AI-Agent Friendly Integration Checklist

When an AI agent is asked to implement backend integration, it should do the following in order:

1. Confirm backend returns `{ data: [...] }` for list endpoints.
2. Validate field names exactly match frontend expectations:
	 `department`, `allocated_amount`, `spent_amount`, `financial_year`, `risk_level`, `reallocation_suggestion`.
3. Ensure numeric fields are numbers, not strings.
4. Ensure `month` is full month name for dashboard trend ordering.
5. Verify CORS allows the Vite port currently in use.
6. Test each connected page route after API wiring.
7. Implement env-based API base URL (remove hardcoded localhost URLs).
8. Add loading/error empty states if any endpoint can return null/partial records.

## 10. Known Integration Risks

- Unit mismatch risk (`Cr` label in UI vs numeric backend amounts).
- Hardcoded API host in multiple files increases deployment mistakes.
- Missing auth token flow (no `Authorization` headers yet).
- Several action buttons are UI-only and do not trigger API calls yet.

## 11. Quick cURL Samples

Get all budgets:

```bash
curl -X GET http://localhost:5000/api/budget/all
```

Get anomalies:

```bash
curl -X GET http://localhost:5000/api/anomaly/all
```

Get predictions:

```bash
curl -X GET http://localhost:5000/api/prediction/all
```

Submit budget entry:

```bash
curl -X POST http://localhost:5000/api/budget/analyze \
	-H "Content-Type: application/json" \
	-d '{
		"state": "Maharashtra",
		"department": "Health",
		"district": "Mumbai",
		"month": "March",
		"financial_year": "2024-25",
		"allocated_amount": 500,
		"spent_amount": 200
	}'
```

## 12. Summary

The frontend is partially integrated and already depends on four backend endpoints.
If backend data follows the contracts above, the dashboard, monitoring, anomaly, lapse, reallocation, prediction, and real-time entry flows will work without further UI changes.
