"""POST /ai/predict-lapse — Batch lapse prediction"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
from models.prediction_model import LapsePredictor

router = APIRouter()

predictor = LapsePredictor()


class DepartmentBudgetInput(BaseModel):
    department_id: str
    department_name: str
    allocated_amount: float
    spent_amount: float
    current_month: int
    monthly_spending: List[float]

class LapsePredictionRequest(BaseModel):
    departments: List[DepartmentBudgetInput]

class LapsePredictionItem(BaseModel):
    department_id: str
    department_name: str
    allocated: float
    spent_so_far: float
    predicted_final_spending: float
    predicted_lapse_amount: float
    lapse_risk_pct: float
    predicted_utilization_pct: float
    risk_level: str
    monthly_forecast: List[float]
    recommendation: str
    ml_risk_level: Optional[str] = None

class LapsePredictionResponse(BaseModel):
    total_departments: int
    critical_count: int
    high_risk_count: int
    total_potential_lapse: float
    avg_utilization: float
    predictions: List[LapsePredictionItem]
    summary: str


@router.post("/predict-lapse", response_model=LapsePredictionResponse)
async def predict_lapse(req: LapsePredictionRequest):

    dept_data = [d.model_dump() for d in req.departments]
    results = predictor.predict_batch(dept_data)

    critical = sum(1 for r in results if r['risk_level'] == 'critical')
    high = sum(1 for r in results if r['risk_level'] == 'high')
    total_lapse = sum(r['predicted_lapse_amount'] for r in results)
    avg_util = float(np.mean([r['predicted_utilization_pct'] for r in results])) if results else 0

    summary = f"{critical} critical, {high} high risk. Total lapse: Rs.{round(total_lapse, 1)}Cr."

    return LapsePredictionResponse(
        total_departments=len(results),
        critical_count=critical,
        high_risk_count=high,
        total_potential_lapse=round(total_lapse, 2),
        avg_utilization=round(avg_util, 2),
        predictions=[LapsePredictionItem(**r) for r in results],
        summary=summary,
    )