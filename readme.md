<div align="center">

# 🏛️ BudgetSetu

**Enterprise-Grade AI-Powered Government Budget Intelligence Platform**

[![Status](https://img.shields.io/badge/Status-Active_Development-success?style=for-the-badge)](#)
[![Complexity](https://img.shields.io/badge/Complexity-High-red?style=for-the-badge)](#)
[![Architecture](https://img.shields.io/badge/Architecture-Microservices-blue?style=for-the-badge)](#)
[![Deployment](https://img.shields.io/badge/Deployment-Docker_Ready-2496ED?style=for-the-badge&logo=docker)](#)

[![React](https://img.shields.io/badge/Frontend-React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](#)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_5-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](#)
[![FastAPI](https://img.shields.io/badge/AI_Engine-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](#)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB_6-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](#)

*Revolutionizing public finance monitoring with real-time anomaly detection, utilization forecasting, and automated reallocation insights.*

</div>

<br/>

---

## 1. What This Project Is

### The Problem Statement
Public finance administration is plagued by inefficiencies, opaque transaction flows, and reactive oversight. Currently, government budget monitoring relies on manual ledger reviews and delayed auditing processes. This leads to two critical failures:
1. **Financial Hemorrhaging**: Suspicious spending or anomalies are detected months after the fact.
2. **Fund Lapses**: Funds allocated to departments go unutilized until the fiscal year-end, leading to hasty, poor-quality spending (the "March Rush") or lapsed budgets.

### The Solution: BudgetSetu
BudgetSetu (internally dubbed *BudgetGuard AI*) is an enterprise-level budget intelligence dashboard. It transforms passive ledger data into proactive, actionable insights. By sitting between departmental transaction entries and the central treasury, BudgetSetu intercepts, analyzes, and predicts spending behavior in real-time.

---

## 2. Key Features

### Technical Highlights & Business Value
| Feature | Technical Implementation | Business Impact |
|---------|-------------------------|-----------------|
| **Real-Time Anomaly Detection** | Hybrid approach utilizing `IsolationForest` ML models combined with statistical domain rules running on a Python FastAPI microservice. | Intercepts fraudulent or erroneous transactions instantly, preventing financial leakage before settlement. |
| **Utilization & Lapse Forecasting** | Time-series projection using weighted moving averages and spending trend classification. | Prevents year-end fund lapses, allowing the government to maximize public utility of allocated capital. |
| **Smart Reallocation Engine** | Algorithmic matching of high-demand and low-utilization departments based on priority scoring matrices. | Ensures fluid capital mobility across sectors, eliminating siloed, stagnant funds. |
| **Microservice Architecture** | Segregated domains: React UI, Express Gateway, and Python ML Engine, orchestrated via Docker. | Ensures high availability, independent horizontal scaling, and isolated failure domains. |

---

## 3. Demo Section

### User Flow
1. **Dashboard Initialization**: The user (Auditor/Administrator) logs in and views the macro-level financial health of all state departments.
2. **Anomaly Triage**: The user navigates to the Anomaly Detection tab to review transactions flagged by the AI Engine. High-severity alerts require manual clearance.
3. **Lapse Prevention**: The system proactively pushes notifications regarding departments pacing behind their utilization targets.
4. **Reallocation Execution**: The platform suggests reallocating `X` amount from `Department A` to `Department B`. The user approves this draft.

*(Screenshots placeholder: The UI employs a clean, data-dense interface utilizing Recharts for financial plotting and Lucide icons for visual hierarchy.)*

---

## 4. System Architecture

BudgetSetu employs a strictly decoupled, microservices-inspired architecture.

```text
+-------------------+       +-----------------------+       +-------------------+
|                   |       |                       |       |                   |
|  React 19 Client  | <---> |  Node.js API Gateway  | <---> |  MongoDB Cluster  |
|  (Vite + Router)  | REST  |  (Express 5 backend)  | MQL   |  (Data Storage)   |
|                   |       |                       |       |                   |
+-------------------+       +-----------+-----------+       +-------------------+
                                        |
                                        | HTTP/REST (Internal Network)
                                        v
                            +-----------------------+
                            |                       |
                            | Python AI Service     |
                            | (FastAPI + scikit)    |
                            |                       |
                            +-----------------------+
```

### Request Flow (New Budget Entry)
1. **Frontend**: Dispatches `POST /api/budget/analyze` with transaction details.
2. **API Gateway (Node.js)**: Receives request, performs schema validation, and creates a pending database entry.
3. **AI Service (Python)**: The Gateway synchronously calls `POST /ai/anomaly-check`. The AI service runs the data through the `IsolationForest` model.
4. **API Gateway**: Receives the anomaly score. If `severity == HIGH`, flags the transaction and stores the anomaly record.
5. **Frontend**: Receives the aggregated response and updates the UI state immediately.

---

## 5. Project Structure

```text
COHERENCE-26_HackBees/
├── frontend/                  # React Single Page Application (SPA)
│   ├── src/
│   │   ├── layouts/           # Shared architectural wrappers (AuthLayout, DashboardLayout)
│   │   ├── pages/             # Route-level components (AnomalyDetection, Dashboard)
│   │   └── App.jsx            # React Router DOM configuration
│   ├── vite.config.js         # Vite bundler configuration
│   └── package.json           # Frontend dependencies
├── backend/                   # Node.js API Gateway
│   ├── src/
│   │   ├── config/            # Environment and Database initialization
│   │   ├── controllers/       # Business logic (Budget, Anomaly, Prediction)
│   │   ├── models/            # Mongoose ODMs (Budget, Anomaly)
│   │   ├── routes/            # Express Router definitions
│   │   ├── services/          # External integrations (Axios to AI Service)
│   │   └── utils/             # Standardized API response handlers & custom errors
│   └── server.js              # Express application entry point
├── ai/                        # Python Machine Learning Microservice
│   ├── models/                # Core ML logic (anomaly_model.py, prediction_model.py)
│   ├── routers/               # FastAPI route definitions
│   ├── trained_models/        # Serialized `.pkl` models for fast loading
│   ├── train_anomaly_model.py # Training pipeline script
│   └── main.py                # Uvicorn ASGI entry point
├── docker-compose.yml         # Container orchestration strategy
└── start-all.bat              # Local development initialization script
```

---

## 6. Technology Stack

### Frontend
- **Core**: React 19, Vite
- **Routing**: React Router DOM v7
- **Visualization**: Recharts
- **Styling**: Modular CSS

### Backend API Gateway
- **Runtime**: Node.js (Express 5)
- **Security**: Helmet, express-rate-limit, bcryptjs, jsonwebtoken
- **Data Fetching**: Axios

### AI & Machine Learning
- **Framework**: FastAPI (Python 3)
- **Data Processing**: Pandas, NumPy
- **Models**: Scikit-Learn (`IsolationForest`)

### Database & DevOps
- **Database**: MongoDB 6.0 (Mongoose ODM)
- **Containerization**: Docker, Docker Compose

---

## 7. Core Engineering Design

### Design Decisions & Rationale
- **Decoupling AI from CRUD**: We specifically chose to split the Node.js backend and the Python AI service. Machine learning inference requires heavy CPU blocking tasks which would choke Node.js's single-threaded event loop. By offloading this to FastAPI, the Node.js gateway remains highly concurrent and non-blocking for standard I/O operations.
- **Fail-Safe AI Integration**: If the Python service goes down, the Node.js backend utilizes a graceful degradation pattern, returning default fallback values (e.g., `anomaly_score: 0`, `severity: LOW` with a warning message). This ensures the primary data-entry application remains functional even during ML outages.

### Maintainability
- **Standardized Error Handling**: The backend utilizes a custom `ApiError` class and an `asyncHandler` wrapper. This eliminates `try-catch` hell in controllers and ensures the frontend always receives a predictable JSON contract.

---

## 8. Database Design

### Entities & Relationships
The system utilizes a NoSQL document model optimized for heavy reads and hierarchical data.

1. **Budget Collection**: The source of truth for departmental ledgers.
   - Automatically calculates `utilization_percentage` on `save()` hooks.
2. **Anomaly Collection**:
   - `budget_id` references the Budget document. Contains the AI explanation, severity score, and resolution status.
3. **Prediction Collection**:
   - Stores forecasted expenditures and reallocation suggestions.

---

## 9. API Design

The REST API utilizes standard HTTP verbs and strict JSON contracts.

### Example: POST `/api/budget/analyze`
**Purpose**: Submits a new budget entry and triggers synchronous AI anomaly checks.

**Request**:
```json
{
  "state": "Maharashtra",
  "department": "Health",
  "district": "Mumbai",
  "month": "March",
  "financial_year": "2024-25",
  "allocated_amount": 500000000,
  "spent_amount": 200000000
}
```

**Standardized Response Envelope**:
```json
{
  "success": true,
  "data": {
    "budget": { ... },
    "anomaly": {
      "anomaly_detected": false,
      "severity": "LOW"
    }
  },
  "message": "Analysis complete"
}
```

---

## 10. Security Architecture

- **Authentication**: JWT-based stateless authentication (implementation in progress).
- **Password Security**: Passwords are hashed using `bcrypt` before persistence.
- **Header Protection**: The Express backend utilizes `Helmet` to secure HTTP headers against XSS and clickjacking.
- **Rate Limiting**: `express-rate-limit` is configured to prevent brute-force attacks and DDoS vectors on critical endpoints.
- **CORS Strategy**: Strictly defined CORS origins via environment variables, ensuring the API only accepts requests from the whitelisted React client.

---

## 11. AI/ML Components

### Model Architecture
The Anomaly Detection Engine utilizes an `IsolationForest` algorithm. Unlike standard profiling, Isolation Forests are exceptionally efficient at detecting outliers in high-dimensional datasets without requiring massive labeled datasets for training.

### Pipeline
1. **Training Phase**: `train_anomaly_model.py` ingests historical ledger data, trains the `IsolationForest`, and serializes the state to a `.pkl` artifact.
2. **Inference Phase**: The FastAPI service loads the `.pkl` artifact into memory at startup (preventing cold starts). Requests are mapped to numpy arrays and scored.

---

## 12. Installation Guide

### Prerequisites
- Node.js (v18+)
- Python (3.9+)
- MongoDB (running locally on `27017`)

### Windows Local Development (Automated)
Execute the provided batch script to spin up all three services simultaneously:
```cmd
start-all.bat
```

### Manual Setup
**1. AI Service**
```bash
cd ai
pip install -r requirements.txt
python main.py
```

**2. Node.js Backend**
```bash
cd backend
npm install
npm run dev
```

**3. React Frontend**
```bash
cd frontend
npm install
npm run dev
```

---

## 13. Docker Deployment

The repository includes a production-ready `docker-compose.yml`.

### Docker Architecture
- **Network**: All containers run on an isolated bridge network (`budgetguard-net`).
- **Volumes**: MongoDB data is persisted via a named Docker volume (`mongodb_data`).
- **Healthchecks**: Strict startup dependencies are defined. The Backend will not spin up until MongoDB reports healthy.

### Spin up the cluster:
```bash
docker-compose up --build -d
```
Access the dashboard at `http://localhost`.

---

## 14. Environment Variables

Create a `.env` file in the `backend/` directory.

| Variable | Description | Default / Example |
|----------|-------------|-------------------|
| `PORT` | API Gateway listening port | `5000` |
| `MONGO_URI` | MongoDB Connection String | `mongodb://localhost:27017/budgetsetu` |
| `AI_SERVICE_URL` | Internal URL for the Python Service | `http://localhost:8000` |
| `JWT_SECRET` | Cryptographic secret for signing tokens | `your_secure_string` |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:5173` |

---

## 15. Development Workflow

- **Branching Strategy**: Standard GitFlow. `main` serves as the stable production branch. Features are developed on `feat/*` branches.
- **Linting**: Both frontend and backend enforce code quality via ESLint and Prettier. Run `npm run format:check` before committing.

---

## 16. Performance Optimizations

- **Event Loop Protection**: As noted, offloading ML processing to Python protects the V8 event loop.
- **Mongoose Indexing**: Collections are indexed on high-frequency query parameters like `department` and `financial_year` to maintain `O(1)` or `O(log n)` read complexity.
- **Vite Bundling**: The frontend utilizes Vite for aggressive tree-shaking, resulting in minimal bundle sizes and instant HMR during development.

---

## 17. Challenges Faced

**Challenge**: Synchronous ML inference latency causing UI blocking.
**Solution**: We initially faced timeouts when the AI model took >2 seconds to score a transaction. We solved this by serializing the Scikit-Learn models to `.pkl` artifacts and pre-loading them into FastAPI's memory on boot, reducing inference time to `<50ms`.

---

## 18. Future Roadmap

- [x] **Phase 1**: Core CRUD, AI Model Training, API Gateway architecture.
- [x] **Phase 2**: Real-time entry analysis and Recharts integration.
- [ ] **Phase 3**: Complete JWT authentication flow and Role-Based Access Control (RBAC).
- [ ] **Phase 4**: Migration of the AI service to AWS SageMaker for auto-scaling inference endpoints.
- [ ] **Phase 5**: Integration with actual treasury APIs via secure webhooks.

---

## 19. Why This Project Matters

**Business Impact**: BudgetSetu prevents the bleeding of public funds. By moving from a reactive auditing model to a proactive predictive model, governments can save millions in misappropriated or lapsed funds.
**Technical Significance**: This project demonstrates the ability to seamlessly orchestrate modern web technologies (React/Node) with heavy data-science workflows (Python/Scikit) in a fault-tolerant, scalable microservices architecture.

---

## 20. Contributors

Developed with precision and passion by **HackBees**.
- **Soham Ghadge** - Lead Developer & Architect

---

## 21. License

This project is licensed under the ISC License.

---

## 22. Acknowledgements

Special thanks to the open-source communities maintaining React, Node.js, and Scikit-Learn, providing the building blocks for enterprise-grade applications.
