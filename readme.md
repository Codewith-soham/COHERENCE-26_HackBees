# BudgetSetu - Smart Public Budget Intelligence for India

BudgetSetu is an AI-powered Government Budget Monitoring and Financial Intelligence System designed for Indian government officers. It monitors public budget allocation, spending patterns, and financial utilization across states, districts, and departments.

This repository currently contains the **Frontend** application, built as a modern Single Page Application (SPA).

---

## 🛠 Tech Stack

*   **Frontend Framework:** React 18 (Bootstrapped with Vite)
*   **Routing:** React Router DOM v6
*   **Styling:** Pure Vanilla CSS (CSS Modules/Global vars) - *No Tailwind or external UI libraries*. Design uses a dedicated government color palette.
*   **Icons:** Lucide-React
*   **Data Visualization:** Recharts

---

## 📁 Project Structure

The frontend application is located entirely within the `/frontend` directory.

```text
frontend/
├── src/
│   ├── App.jsx                 # Main entry point and Route definitions
│   ├── index.css               # Global CSS variables and design system tokens
│   ├── layouts/                # Wrapper layouts
│   │   ├── AuthLayout.jsx      # Centered layout for Login/Signup
│   │   └── DashboardLayout.jsx # Authenticated layout with Sidebar & Header
│   ├── components/
│   │   ├── navigation/         # Sidebar.jsx, Header.jsx
│   │   └── ui/                 # Reusable generic components (Button, Card, Input, Select, Badge)
│   └── pages/                  # All 12 application views
│       ├── Landing.jsx
│       ├── Login.jsx, SignUp.jsx
│       ├── Dashboard.jsx
│       ├── BudgetMonitoring.jsx
│       ├── AnomalyDetection.jsx
│       ├── LapsePrediction.jsx
│       ├── Reallocation.jsx
│       ├── BudgetPrediction.jsx
│       ├── RealTimeEntry.jsx
│       ├── Reports.jsx
│       └── Settings.jsx
```

---

## 🔗 Backend API Requirements & Contracts

To make the frontend fully functional, the backend **must** expose specific REST API endpoints. The frontend currently uses mocked static data arrays in the `.jsx` files. Below is the required API contract based on what the UI expects.

### 1. Authentication
*   **POST** `/api/auth/login`
    *   *Request:* `{ identifier, password }`
    *   *Response:* JWT Token + User Data (Name, Officer ID, Department, Role).
*   **POST** `/api/auth/register`
    *   *Request:* `{ fullName, officerId, department, email, password }`
    *   *Expected behavior:* Creates a new officer account awaiting admin approval.

### 2. Main Dashboard & Budget Summaries (Page 4, 5)
*   **GET** `/api/budget/summary`
    *   *Query Params:* `state`, `district`, `department`, `fy` (Financial Year)
    *   *Response Strategy:* Needs to return aggregate numbers: `totalAllocated`, `totalSpent`, `remainingPool`, `averageUtilization`.
*   **GET** `/api/budget/trends`
    *   *Response:* Monthly data points for line charts. Array of `{ month: 'Apr', spent: 4000 }`.
*   **GET** `/api/budget/department-comparison`
    *   *Response:* Data for bar charts. Array of `{ name: 'Health', allocated: 12000, spent: 8000 }`.
*   **GET** `/api/budget/recent-activity` 
    *   *Response:* Array of transactions containing `{ id, state, district, dept, allocated, spent, remaining, fy }`.

### 3. AI & Analytical Features (Page 6, 7, 8, 9)
The backend needs a dedicated AI/Analytics engine (e.g., Python microservice or integrated logic) to feed these endpoints.
*   **GET** `/api/ai/anomalies`
    *   *Purpose:* Page 6 (AI Anomaly Detection)
    *   *Expected Response Model:* Array of `{ id, state, district, dept, riskScore (0-100), reason (string explaining the anomaly), amount (flagged amount) }`.
*   **GET** `/api/ai/lapse-predictions`
    *   *Purpose:* Page 7 (Fund Lapse Prediction)
    *   *Expected Response Model:* Array of `{ id, state, district, dept, allocated, spent, utilization (percentage), fy, riskLevel ('High', 'Medium', 'Low') }`.
*   **GET** `/api/ai/reallocations`
    *   *Purpose:* Page 8 (Fund Reallocation)
    *   *Expected Response Model:* Array of `{ id, source (dept name), sourceUtil (%), dest (dept name), destUtil (%), amount (number), reason (string) }`.
*   **GET** `/api/ai/forecasts`
    *   *Purpose:* Page 9 (Budget Prediction)
    *   *Expected Response Model:* Time-series data combining actual historical data with future AI predictions. Array of `{ year, actual (number or null), forecast (number) }`.

### 4. Administrative & Form Entries (Page 10, 11, 12)
*   **POST** `/api/budget/transaction`
    *   *Purpose:* Page 10 (Real-Time Budget Entry)
    *   *Request Payload:* `{ state, district, department, fy, type ('allocation' or 'spending'), allocated (amount), spent (amount), remarks }`
*   **POST** `/api/budget/bulk-upload`
    *   *Purpose:* Page 10 (CSV/Excel bulk data ingestion)
    *   *Request:* `multipart/form-data` containing the file.
*   **POST** `/api/reports/generate`
    *   *Purpose:* Page 11 (Reports)
    *   *Request:* Filters `{ state, department, fy, reportType }`
    *   *Response:* A downloadable URL or a direct binary stream of the PDF/Excel/CSV file.
*   **GET / PUT** `/api/user/profile`
    *   *Purpose:* Page 12 (Settings)
    *   *Operations:* Fetch current officer profile data and update details (Name, Phone, Password).

---

## 🎨 Design Rules & UI Constraints

If you are modifying the frontend, you must adhere strictly to these rules set out in the initial requirements:
1.  **No Tailwind CSS:** All styles are mapped using standard CSS methodologies located inside specific `.css` files.
2.  **Color Variables:** Enforced globally in `frontend/src/index.css`:
    *   `--primary`: Deep Government Blue (`#1A3D7C`)
    *   `--accent`: Indian Saffron tone (`#FF9933`)
    *   `--bg-secondary`: Light Grey (`#F5F6F8`)
    *   Indicators: Green (Success), Orange (Warning), Red (Alert).
3.  **Responsiveness:** Use CSS media queries to ensure the sidebar collapses gracefully on screens below `768px`.

---

## 🚀 How to Run the Frontend Locally

1.  Make sure you have [Node.js](https://nodejs.org/) installed on your machine.
2.  Open your terminal and navigate to the `frontend` folder:
    ```bash
    cd frontend
    ```
3.  Install all required dependencies:
    ```bash
    npm install
    ```
4.  Start the Vite development server:
    ```bash
    npm run dev
    ```
5.  Open your browser and navigate to `http://localhost:5173/` (or the port specified in your terminal).

To create a production build:
```bash
npm run build
```
