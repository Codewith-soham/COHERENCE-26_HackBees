## BudgetGuard AI

BudgetGuard AI is a FastAPI-based service for public finance monitoring. It focuses on government budget oversight by detecting unusual spending, predicting end-of-year fund lapse risk, recommending reallocation opportunities, and evaluating new budget entries in real time.

### What this project does

- Detects suspicious transactions using a hybrid ML + rules approach
- Predicts under-utilization and potential year-end lapses for departments
- Suggests fund reallocation between low-demand and high-demand departments
- Analyzes newly submitted field entries and generates alerts when needed
- Exposes backend-friendly endpoints for app integration

### Core features

#### 1. Anomaly detection

The anomaly pipeline combines:

- a trained `IsolationForest` model
- statistical checks on transaction amounts
- domain rules such as March-end spending spikes, round amounts, and near-threshold transactions

Main endpoints:

- `POST /ai/anomaly-check`
- `POST /ai/detect-anomalies`

#### 2. Lapse prediction

The lapse predictor estimates final utilization using:

- weighted moving averages
- spending trend detection
- optional ML classification for second-opinion risk labeling

Main endpoints:

- `POST /ai/predict-utilization`
- `POST /ai/predict-lapse`

#### 3. Reallocation suggestions

The reallocation service identifies donor and receiver departments based on utilization, demand, and priority scores.

Main endpoint:

- `POST /ai/suggest-reallocation`

#### 4. Real-time entry analysis

New officer-submitted entries are checked immediately for:

- anomaly risk
- effect on lapse risk
- whether an alert should be raised
- dashboard updates after the transaction is applied

Main endpoint:

- `POST /ai/analyze-new-entry`

### Project structure

- `ai/main.py` - FastAPI entry point and router registration
- `ai/models/anomaly_model.py` - anomaly detection engine
- `ai/models/prediction_model.py` - lapse prediction engine
- `ai/routers/` - API endpoints
- `ai/train_anomaly_model.py` - anomaly model training script
- `ai/train_lapse_model.py` - lapse classifier training script
- `ai/data/` - sample training and testing datasets
- `ai/trained_models/` - generated model artifacts

### API summary

- `GET /ai/health` - health check
- `POST /ai/anomaly-check` - single-entry anomaly scoring for backend integration
- `POST /ai/predict-utilization` - single-department utilization forecast
- `POST /ai/detect-anomalies` - batch transaction anomaly detection
- `POST /ai/predict-lapse` - batch lapse prediction
- `POST /ai/suggest-reallocation` - reallocation recommendation engine
- `POST /ai/analyze-new-entry` - real-time transaction impact analysis

### Local setup

1. Create and activate a Python virtual environment.
2. Install the required packages:
	 - `fastapi`
	 - `uvicorn`
	 - `numpy`
	 - `pandas`
	 - `scikit-learn`
	 - `pydantic`
3. Move into the AI service folder.
4. Start the API server.

Suggested run flow:

- Train models if required:
	- `python train_anomaly_model.py`
	- `python train_lapse_model.py`
- Start the service:
	- `python main.py`

The API runs on port `8000` by default.

### Current implementation notes

- Routers are registered only in `ai/main.py`
- Backend bridge endpoints are designed to match frontend/backend integration needs
- Real-time analysis now returns anomaly checks, lapse updates, alert metadata, dashboard updates, and a human-readable message

### Goal

This project is intended to support smarter government budget monitoring by making unusual spending patterns, utilization risks, and reallocation opportunities visible earlier.
