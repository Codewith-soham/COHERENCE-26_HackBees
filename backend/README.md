# BudgetSetu Backend

A Node.js + Express REST API for government budget management with AI-powered anomaly detection and spending predictions.

## What This Does

This backend handles:
- **Budget Management** — Store and retrieve department/district budget data
- **Anomaly Detection** — Automatically flag suspicious spending patterns using AI
- **Spending Predictions** — Forecast budget utilization and suggest fund reallocation

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Express 5  | Web framework |
| MongoDB + Mongoose | Database |
| Axios | HTTP client for AI service |
| dotenv | Environment variables |

---

## Project Structure

```
backend/
├── server.js              # Entry point — connects DB and starts server
├── src/
│   ├── app.js             # Express app setup, routes, middleware
│   ├── config/
│   │   └── dbConnection.js    # MongoDB connection logic
│   ├── controllers/
│   │   ├── budgetController.js     # Budget CRUD + AI analysis
│   │   ├── anomalyController.js    # Anomaly queries
│   │   └── predictionController.js # Prediction queries
│   ├── models/
│   │   ├── budget.js      # Budget schema (auto-calculates utilization %)
│   │   ├── anomaly.js     # Anomaly schema (linked to budget)
│   │   └── prediction.js  # Prediction schema
│   ├── routes/
│   │   ├── budgetRoute.js
│   │   ├── anomalyRoute.js
│   │   └── predictionRoute.js
│   ├── services/
│   │   └── aiService.js   # Calls Python AI service for anomaly/prediction
│   ├── middleware/
│   │   └── errorhandler.js    # Global error handler
│   └── utils/
│       ├── ApiError.js    # Custom error class
│       ├── ApiResponse.js # Standardized response format
│       └── asyncHandler.js # Async wrapper to catch errors
```

---

## API Endpoints

### Budget Routes (`/api/budget`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/analyze` | Submit budget data → saves to DB + runs AI anomaly check |
| GET | `/all` | Get all budget records |
| GET | `/department/:dept` | Filter budgets by department name |
| GET | `/district/:dist` | Filter budgets by district name |
| GET | `/:id` | Get single budget by MongoDB ID |

### Anomaly Routes (`/api/anomaly`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/all` | Get all detected anomalies |
| GET | `/high` | Get only HIGH severity anomalies |
| GET | `/department/:dept` | Filter anomalies by department |

> ⚠️ Anomalies are created automatically when you POST to `/api/budget/analyze` — no manual creation endpoint.

### Prediction Routes (`/api/prediction`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/run` | Run AI prediction for a department/district |
| GET | `/all` | Get all predictions |
| GET | `/high-risk` | Get only HIGH risk predictions |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Returns `{ success: true }` if server is running |

---

## Data Models

### Budget
```javascript
{
  department: String,          // e.g., "Education"
  district: String,            // e.g., "Pune"
  month: String,               // e.g., "January"
  financial_year: String,      // e.g., "2025-26"
  allocated_amount: Number,    // e.g., 5000000
  spent_amount: Number,        // e.g., 4200000
  utilization_percentage: Number  // Auto-calculated on save
}
```

### Anomaly
```javascript
{
  budget_id: ObjectId,         // Reference to Budget document
  department: String,
  district: String,
  anomaly_detected: Boolean,   // true if spending pattern is suspicious
  anomaly_score: Number,       // 0-100 risk score
  explanation: String,         // AI-generated reason
  severity: "LOW" | "MEDIUM" | "HIGH"
}
```

### Prediction
```javascript
{
  department: String,
  district: String,
  financial_year: String,
  allocated_amount: Number,
  projected_spending: Number,      // AI-predicted total spend
  predicted_unused: Number,        // Expected leftover funds
  risk_level: "LOW" | "MEDIUM" | "HIGH",
  reallocation_suggestion: String  // AI recommendation
}
```

---

## Getting Started

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Environment Variables

Create a `.env` file in the `backend/` folder:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/budgetsetu
AI_SERVICE_URL=http://localhost:8000
```

### 3. Start the Server

**Development** (with auto-reload):
```bash
npm run dev
```

**Production**:
```bash
npm start
```

---

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm run dev` | `nodemon server.js` | Start with hot-reload |
| `npm start` | `node server.js` | Start production server |
| `npm run format` | `prettier --write .` | Format all files |
| `npm run format:check` | `prettier --check .` | Check formatting |

---

## How the AI Service Works

The backend calls an external Python AI service for anomaly detection and spending predictions.

### AI Service Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ANOMALY DETECTION FLOW                            │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────┐      POST /api/budget/analyze       ┌──────────────────┐
  │  Client  │ ──────────────────────────────────▶ │  Express Backend │
  └──────────┘                                     └────────┬─────────┘
                                                            │
                                                            ▼
                                                   ┌─────────────────┐
                                                   │  Save Budget to │
                                                   │    MongoDB      │
                                                   └────────┬────────┘
                                                            │
                                                            ▼
                                         ┌──────────────────────────────────┐
                                         │  Call AI Service (aiService.js) │
                                         │  POST /ai/anomaly-check         │
                                         └────────────────┬─────────────────┘
                                                          │
                              ┌────────────────────────────┼────────────────────────────┐
                              │                            │                            │
                              ▼                            ▼                            │
                    ┌─────────────────┐          ┌─────────────────┐                    │
                    │  AI Service UP  │          │ AI Service DOWN │                    │
                    │  (Python:8000)  │          │   (Fallback)    │                    │
                    └────────┬────────┘          └────────┬────────┘                    │
                             │                            │                            │
                             ▼                            ▼                            │
                    ┌─────────────────┐          ┌─────────────────┐                    │
                    │ Returns:        │          │ Returns:        │                    │
                    │ - anomaly_score │          │ - anomaly_score │                    │
                    │ - severity      │          │   = 0           │                    │
                    │ - explanation   │          │ - severity=LOW  │                    │
                    │ - detected flag │          │ - "Manual review│                    │
                    └────────┬────────┘          │   recommended"  │                    │
                             │                   └────────┬────────┘                    │
                             │                            │                            │
                             └────────────────────────────┼────────────────────────────┘
                                                          │
                                                          ▼
                                                 ┌─────────────────┐
                                                 │ Save Anomaly to │
                                                 │    MongoDB      │
                                                 │ (linked to      │
                                                 │  budget_id)     │
                                                 └────────┬────────┘
                                                          │
                                                          ▼
  ┌──────────┐      { budget, anomaly }          ┌─────────────────┐
  │  Client  │ ◀──────────────────────────────── │    Response     │
  └──────────┘                                   └─────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                         PREDICTION FLOW                                     │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────┐      POST /api/prediction/run       ┌──────────────────┐
  │  Client  │ ───────────────────────────────────▶│  Express Backend │
  └──────────┘                                     └────────┬─────────┘
       │                                                    │
       │  Request Body:                                     ▼
       │  {                                      ┌────────────────────┐
       │    department,                          │ Call AI Service    │
       │    district,                            │ POST /ai/predict-  │
       │    financial_year,                      │ utilization        │
       │    allocated_amount,                    └─────────┬──────────┘
       │    current_spent,                                 │
       │    month                                          ▼
       │  }                                      ┌────────────────────┐
       │                                         │ AI Returns:        │
       │                                         │ - projected_spend  │
       │                                         │ - predicted_unused │
       │                                         │ - risk_level       │
       │                                         │ - reallocation_    │
       │                                         │   suggestion       │
       │                                         └─────────┬──────────┘
       │                                                   │
       │                                                   ▼
       │                                         ┌────────────────────┐
       │                                         │ Save Prediction to │
       │                                         │     MongoDB        │
       │                                         └─────────┬──────────┘
       │                                                   │
       │          { prediction }                           │
       └◀──────────────────────────────────────────────────┘
```

### AI Endpoints Called

| Backend Action | AI Endpoint | Request Payload | Response |
|----------------|-------------|-----------------|----------|
| `POST /api/budget/analyze` | `POST /ai/anomaly-check` | `{ department, district, month, financial_year, allocated_amount, spent_amount, utilization_percentage }` | `{ anomaly_detected, anomaly_score, severity, explanation }` |
| `POST /api/prediction/run` | `POST /ai/predict-utilization` | `{ department, district, financial_year, allocated_amount, current_spent, month }` | `{ projected_spending, predicted_unused, risk_level, reallocation_suggestion }` |

### Fallback Behavior

If the AI service is unreachable, the backend **does not fail**. Instead, it returns safe default values:

**Anomaly Fallback:**
```javascript
{
  anomaly_detected: false,
  anomaly_score: 0,
  severity: "LOW",
  explanation: "AI service unavailable — manual review recommended"
}
```

**Prediction Fallback:**
```javascript
{
  projected_spending: 0,
  predicted_unused: 0,
  risk_level: "LOW",
  reallocation_suggestion: "AI service unavailable — manual review recommended"
}
```

### Setting Up the AI Service

The AI service URL is configured via environment variable:

```env
AI_SERVICE_URL=http://localhost:8000
```

The Python AI service should expose:
- `POST /ai/anomaly-check` — Analyze budget data for anomalies
- `POST /ai/predict-utilization` — Predict spending patterns

---

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": []
}
```

Success responses:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

---

## Author

**Soham Ghadge**

---

## Need Help?

1. Check the `/health` endpoint to verify server is running
2. Make sure MongoDB is connected (`MONGO_URI` is correct)
3. Check if AI service is running if anomaly detection isn't working
