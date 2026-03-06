"""
BACKEND BRIDGE
===============
These endpoints match EXACTLY what Soham's aiService.js calls.

His backend calls:
  POST /ai/anomaly-check         → We handle here
  POST /ai/predict-utilization   → We handle here

We translate his format → our AI → translate back to his format.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import numpy as np
from datetime import datetime
from models.anomaly_model import AnomalyDetector
from models.prediction_model import LapsePredictor

router = APIRouter()
detector = AnomalyDetector()
predictor = LapsePredictor()


# ================================================================
# ENDPOINT 1: POST /ai/anomaly-check
# This is what his aiService.js actually calls
# ================================================================

class AnomalyCheckRequest(BaseModel):
    department: str
    district: Optional[str] = ""
    month: Optional[str] = ""
    financial_year: Optional[str] = "2025-26"
    allocated_amount: float
    spent_amount: float
    utilization_percentage: Optional[float] = None

class AnomalyCheckResponse(BaseModel):
    anomaly_detected: bool
    anomaly_score: float
    severity: str
    explanation: str


@router.post("/anomaly-check", response_model=AnomalyCheckResponse)
async def anomaly_check(req: AnomalyCheckRequest):

    # Convert his month name to number
    month_map = {
        "january": 1, "february": 2, "march": 3, "april": 4,
        "may": 5, "june": 6, "july": 7, "august": 8,
        "september": 9, "october": 10, "november": 11, "december": 12,
    }
    month_num = month_map.get(req.month.lower().strip(), 6) if req.month else 6
    year = 2025 if month_num >= 4 else 2026
    date_str = f"{year}-{month_num:02d}-15"

    # Convert amounts — his might be in actual rupees, ours are in Crores
    amount_in_cr = req.spent_amount
    allocated_cr = req.allocated_amount
    if req.spent_amount > 100000:
        amount_in_cr = req.spent_amount / 10000000
        allocated_cr = req.allocated_amount / 10000000

    # Create transaction from his budget data
    main_txn = {
        "id": f"BDG-{req.department[:3].upper()}-{req.district[:3].upper() if req.district else 'ALL'}",
        "department": req.department,
        "amount": float(amount_in_cr),
        "date": date_str,
        "category": "budget-entry",
        "description": f"Budget entry for {req.department} {req.district} {req.month} {req.financial_year}",
        "vendor": "Government",
    }

    # Create reference transactions so ML has context
    avg_monthly = allocated_cr / 12
    reference_txns = []
    for i in range(6):
        ref_amount = float(avg_monthly * np.random.uniform(0.6, 1.4))
        ref_month = np.random.randint(4, 13)
        reference_txns.append({
            "id": f"REF-{i}",
            "department": req.department,
            "amount": round(ref_amount, 2),
            "date": f"2025-{ref_month:02d}-15",
            "category": "budget-entry",
            "description": "Reference transaction",
            "vendor": "Government",
        })

    # Run anomaly detection
    all_txns = reference_txns + [main_txn]
    results = detector.detect(all_txns)

    # Find the result for our main transaction
    our_result = None
    for r in results:
        if r['transaction_id'] == main_txn['id']:
            our_result = r
            break

    if our_result is None:
        our_result = results[0]

    # Convert to HIS format
    # Our score: 0.0-1.0 → His score: 0-100
    his_score = round(our_result['anomaly_score'] * 100, 1)

    # Our severity: lowercase → His: UPPERCASE
    severity_map = {"critical": "HIGH", "high": "HIGH", "medium": "MEDIUM", "low": "LOW"}
    his_severity = severity_map.get(our_result['severity'], "LOW")

    # Explanation
    explanation = "; ".join(our_result['reasons'][:3])
    if not our_result['is_anomaly']:
        explanation = "No significant anomalies detected in this budget entry."

    return AnomalyCheckResponse(
        anomaly_detected=our_result['is_anomaly'],
        anomaly_score=his_score,
        severity=his_severity,
        explanation=explanation,
    )


# ================================================================
# ENDPOINT 2: POST /ai/predict-utilization
# This is what his aiService.js actually calls
# ================================================================

class PredictUtilizationRequest(BaseModel):
    department: str
    district: Optional[str] = ""
    financial_year: Optional[str] = "2025-26"
    allocated_amount: float
    current_spent: float
    month: Optional[str] = ""

class PredictUtilizationResponse(BaseModel):
    projected_spending: float
    predicted_unused: float
    risk_level: str
    reallocation_suggestion: str


@router.post("/predict-utilization", response_model=PredictUtilizationResponse)
async def predict_utilization(req: PredictUtilizationRequest):

    # Figure out FY month
    month_map = {
        "january": 10, "february": 11, "march": 12,
        "april": 1, "may": 2, "june": 3, "july": 4,
        "august": 5, "september": 6, "october": 7,
        "november": 8, "december": 9,
    }
    current_fy_month = month_map.get(req.month.lower().strip(), 6) if req.month else 6

    # Use his amounts directly (keep in same unit he sends)
    allocated = req.allocated_amount
    spent = req.current_spent

    # Generate synthetic monthly spending
    months_done = max(1, current_fy_month)
    if spent > 0:
        avg_monthly = spent / months_done
        monthly_spending = []
        remaining = spent
        for i in range(months_done):
            if i == months_done - 1:
                month_spend = remaining
            else:
                month_spend = avg_monthly * np.random.uniform(0.8, 1.2)
                month_spend = min(month_spend, remaining)
            monthly_spending.append(round(float(max(0, month_spend)), 2))
            remaining -= month_spend
    else:
        monthly_spending = [0] * months_done

    # Build OUR format
    dept_data = {
        "department_id": f"DEPT-{req.department[:3].upper()}",
        "department_name": req.department,
        "allocated_amount": allocated,
        "spent_amount": spent,
        "current_month": months_done,
        "monthly_spending": monthly_spending,
    }

    # Run prediction
    result = predictor.predict_single(dept_data)

    # Convert to HIS format
    severity_map = {"critical": "HIGH", "high": "HIGH", "medium": "MEDIUM", "low": "LOW"}
    his_risk = severity_map.get(result['risk_level'], "LOW")

    if result['risk_level'] in ['critical', 'high']:
        suggestion = (
            f"{req.department} is projected to underutilize "
            f"{round(result['lapse_risk_pct'], 1)}% of allocated funds. "
            f"Estimated unused: {round(result['predicted_lapse_amount'], 2)}. "
            f"{result['recommendation']}"
        )
    elif result['risk_level'] == 'medium':
        suggestion = f"{req.department} is slightly behind spending targets. {result['recommendation']}"
    else:
        suggestion = f"{req.department} is on track. No reallocation needed."

    return PredictUtilizationResponse(
        projected_spending=round(float(result['predicted_final_spending']), 2),
        predicted_unused=round(float(result['predicted_lapse_amount']), 2),
        risk_level=his_risk,
        reallocation_suggestion=suggestion,
    )