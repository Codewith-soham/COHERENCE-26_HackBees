import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";

import DashboardLayout   from "./layouts/DashboardLayout";
import AuthLayout        from "./layouts/AuthLayout";

import Landing           from "./pages/Landing";
import Login             from "./pages/Login";
import SignUp            from "./pages/SignUp";
import Dashboard         from "./pages/Dashboard";
import BudgetMonitoring  from "./pages/BudgetMonitoring";
import AnomalyDetection  from "./pages/AnomalyDetection";
import LapsePrediction   from "./pages/LapsePrediction";
import BudgetPrediction  from "./pages/BudgetPrediction";
import Reallocation      from "./pages/Reallocation";
import RealTimeEntry     from "./pages/RealTimeEntry";
import Reports           from "./pages/Reports";
import Settings          from "./pages/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          <Route path="/"       element={<Landing />} />
          <Route path="/login"  element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          <Route element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="/dashboard"    element={<Dashboard />} />
            <Route path="/monitoring"   element={<BudgetMonitoring />} />
            <Route path="/anomalies"    element={<AnomalyDetection />} />
            <Route path="/lapse"        element={<LapsePrediction />} />
            <Route path="/prediction"   element={<BudgetPrediction />} />
            <Route path="/reallocation" element={<Reallocation />} />
            <Route path="/entry"        element={<RealTimeEntry />} />
            <Route path="/reports"      element={<Reports />} />
            <Route path="/settings"     element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}