"""
Lapse Prediction Model
Weighted Moving Average + Trend Detection + optional ML classifier
"""

import numpy as np
import pickle
import os


class LapsePredictor:

    SEASONAL_WEIGHTS = [
        0.06, 0.07, 0.08, 0.08, 0.08, 0.09,
        0.09, 0.10, 0.10, 0.08, 0.08, 0.09,
    ]

    def __init__(self):
        self.classifier = None
        self.has_classifier = False
        self._load_classifier()

    def _load_classifier(self):
        path = "trained_models/lapse_classifier.pkl"
        if os.path.exists(path):
            with open(path, "rb") as f:
                data = pickle.load(f)
            self.classifier = data["model"]
            self.label_names = data.get("label_names", {0: "Low", 1: "Medium", 2: "High", 3: "Critical"})
            self.has_classifier = True
            print(f"[LapsePredictor] Loaded classifier (accuracy: {data.get('accuracy', 'unknown')})")
        else:
            print("[LapsePredictor] No classifier found. Using math-only approach.")

    def predict_single(self, dept_data):
        """Predict lapse risk for one department"""

        allocated = dept_data['allocated_amount']
        spent = dept_data['spent_amount']
        current_month = dept_data['current_month']
        monthly = np.array(dept_data['monthly_spending'], dtype=float)
        remaining_months = 12 - current_month

        if remaining_months <= 0:
            lapse = max(0, allocated - spent)
            return self._build_result(dept_data, spent, lapse, [], allocated)

        if len(monthly) == 0:
            return self._build_result(dept_data, 0, allocated, [0] * remaining_months, allocated)

        # Step 1: Weighted Moving Average
        weighted_avg = self._weighted_moving_average(monthly)

        # Step 2: Trend detection
        trend = self._calculate_trend(monthly)

        # Step 3: Forecast remaining months
        forecast = self._forecast_months(weighted_avg, trend, current_month, remaining_months)

        # Step 4: Calculate lapse
        predicted_additional = sum(forecast)
        predicted_total = spent + predicted_additional
        lapse = max(0, allocated - predicted_total)

        result = self._build_result(dept_data, predicted_total, lapse, forecast, allocated)

        # Step 5: ML classifier second opinion (if available)
        if self.has_classifier:
            ml_risk = self._classify_with_ml(dept_data, monthly, remaining_months)
            result["ml_risk_level"] = ml_risk

        return result

    def predict_batch(self, departments):
        """Predict for multiple departments"""
        results = []
        for dept in departments:
            result = self.predict_single(dept)
            results.append(result)
        results.sort(key=lambda x: x['lapse_risk_pct'], reverse=True)
        return results

    def _weighted_moving_average(self, monthly):
        n = len(monthly)
        if n == 1:
            return float(monthly[0])
        if n == 2:
            return float(np.average(monthly[-2:], weights=[0.3, 0.7]))
        recent = monthly[-3:]
        weights = np.array([0.2, 0.3, 0.5])
        return float(np.average(recent, weights=weights))

    def _calculate_trend(self, monthly):
        if len(monthly) < 2:
            return 0.0
        x = np.arange(len(monthly))
        n = len(x)
        slope = float(
            (n * np.sum(x * monthly) - np.sum(x) * np.sum(monthly)) /
            (n * np.sum(x**2) - np.sum(x)**2 + 1e-10)
        )
        return slope

    def _forecast_months(self, base_rate, trend, current_month, remaining):
        forecast = []
        for i in range(remaining):
            future_month = current_month + i
            if future_month < 12:
                seasonal = self.SEASONAL_WEIGHTS[future_month] / np.mean(self.SEASONAL_WEIGHTS)
            else:
                seasonal = 1.0
            dampened_trend = trend * (0.7 ** i)
            predicted = max(0, (base_rate + dampened_trend) * seasonal)
            forecast.append(round(float(predicted), 2))
        return forecast

    def _classify_with_ml(self, dept_data, monthly, remaining_months):
        try:
            utilization = dept_data.get('utilization_rate',
                (dept_data['spent_amount'] / dept_data['allocated_amount'] * 100)
                if dept_data['allocated_amount'] > 0 else 0)

            if len(monthly) >= 2:
                x = np.arange(len(monthly))
                n = len(x)
                trend = (n * np.sum(x * monthly) - np.sum(x) * np.sum(monthly)) / (n * np.sum(x**2) - np.sum(x)**2 + 1e-10)
            else:
                trend = 0

            volatility = np.std(monthly) / (np.mean(monthly) + 1e-10)
            avg_recent = np.mean(monthly[-3:]) if len(monthly) >= 3 else np.mean(monthly)

            if len(monthly) >= 4:
                first_half = np.mean(monthly[:len(monthly)//2])
                second_half = np.mean(monthly[len(monthly)//2:])
                acceleration = (second_half - first_half) / (first_half + 1e-10)
            else:
                acceleration = 0

            features = np.array([[
                utilization, remaining_months, trend, volatility,
                avg_recent, acceleration, dept_data['allocated_amount']
            ]])

            label = self.classifier.predict(features)[0]
            return self.label_names.get(label, "unknown")
        except Exception as e:
            print(f"[LapsePredictor] ML classification failed: {e}")
            return "unknown"

    def _build_result(self, dept, predicted_total, lapse, forecast, allocated):
        spent = dept['spent_amount']

        if allocated > 0:
            lapse_risk_pct = (lapse / allocated) * 100
            utilization_pct = (predicted_total / allocated) * 100
        else:
            lapse_risk_pct = 0
            utilization_pct = 0

        if lapse_risk_pct >= 40:
            risk_level = "critical"
        elif lapse_risk_pct >= 25:
            risk_level = "high"
        elif lapse_risk_pct >= 10:
            risk_level = "medium"
        else:
            risk_level = "low"

        recommendation = self._generate_recommendation(
            dept.get('department_name', 'Unknown'), lapse_risk_pct, risk_level, lapse
        )

        return {
            "department_id": dept.get('department_id', 'UNKNOWN'),
            "department_name": dept.get('department_name', 'Unknown'),
            "allocated": float(allocated),
            "spent_so_far": float(spent),
            "predicted_final_spending": round(float(predicted_total), 2),
            "predicted_lapse_amount": round(float(lapse), 2),
            "lapse_risk_pct": round(float(lapse_risk_pct), 2),
            "predicted_utilization_pct": round(float(min(utilization_pct, 100)), 2),
            "risk_level": risk_level,
            "monthly_forecast": forecast,
            "recommendation": recommendation,
        }

    def _generate_recommendation(self, name, risk_pct, level, lapse_amt):
        if level == "critical":
            return (
                f"CRITICAL: {name} projected to leave Rs.{round(lapse_amt, 1)}Cr unused "
                f"({round(risk_pct, 1)}% lapse risk). "
                f"1) Fast-track pending project approvals, "
                f"2) Reallocate Rs.{round(lapse_amt * 0.6, 1)}Cr to high-demand departments, "
                f"3) Escalate to Finance Secretary."
            )
        elif level == "high":
            return (
                f"WARNING: {name} spending below target. "
                f"Projected lapse: Rs.{round(lapse_amt, 1)}Cr. "
                f"Accelerate procurement. Consider partial reallocation."
            )
        elif level == "medium":
            return f"MONITOR: {name} slightly behind schedule. Needs spending acceleration."
        else:
            return f"ON TRACK: {name} utilization is healthy."