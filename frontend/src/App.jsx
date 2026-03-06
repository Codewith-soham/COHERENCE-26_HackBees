import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

import Landing from './pages/Landing';
import Login from './pages/Login';
import SignUp from './pages/SignUp';

import Dashboard from './pages/Dashboard';
import BudgetMonitoring from './pages/BudgetMonitoring';
import AnomalyDetection from './pages/AnomalyDetection';
import LapsePrediction from './pages/LapsePrediction';
import Reallocation from './pages/Reallocation';
import BudgetPrediction from './pages/BudgetPrediction';
import RealTimeEntry from './pages/RealTimeEntry';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />

        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
        </Route>

        {/* Protected Dashboard Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/monitoring" element={<BudgetMonitoring />} />
          <Route path="/anomalies" element={<AnomalyDetection />} />
          <Route path="/lapse" element={<LapsePrediction />} />
          <Route path="/reallocation" element={<Reallocation />} />
          <Route path="/prediction" element={<BudgetPrediction />} />
          <Route path="/entry" element={<RealTimeEntry />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
