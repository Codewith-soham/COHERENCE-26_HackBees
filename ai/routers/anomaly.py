"""POST /ai/detect-anomalies — Batch anomaly detection (advanced)"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from models.anomaly_model import AnomalyDetector

router = APIRouter()
detector = AnomalyDetector()


class TransactionInput(BaseModel):
    id: str
    department: str
    amount: float
    date: str
    category: Optional[str] = ""
    description: Optional[str] = ""
    vendor: Optional[str] = ""

class AnomalyRequest(BaseModel):
    transactions: List[TransactionInput]

class AnomalyResultItem(BaseModel):
    transaction_id: str
    department: str
    amount: float
    date: str
    anomaly_score: float
    is_anomaly: bool
    ml_score: float
    rule_score: float
    reasons: List[str]
    severity: str

class AnomalyResponse(BaseModel):
    total_analyzed: int
    anomalies_found: int
    anomaly_rate: float
    critical_count: int
    high_count: int
    results: List[AnomalyResultItem]
    summary: str


@router.post("/detect-anomalies", response_model=AnomalyResponse)
async def detect_anomalies(req: AnomalyRequest):

    transactions_data = [txn.model_dump() for txn in req.transactions]
    results = detector.detect(transactions_data)

    anomalies = [r for r in results if r['is_anomaly']]
    critical = sum(1 for r in anomalies if r['severity'] == 'critical')
    high = sum(1 for r in anomalies if r['severity'] == 'high')
    total = len(transactions_data)

    if critical > 0:
        summary = f"ALERT: {critical} CRITICAL anomalies! {len(anomalies)} suspicious out of {total}."
    elif high > 0:
        summary = f"WARNING: {high} high-severity anomalies. {len(anomalies)} suspicious out of {total}."
    else:
        summary = f"{len(anomalies)} minor anomalies out of {total} transactions."

    flagged = [r for r in results if r['is_anomaly'] or r['anomaly_score'] > 0.4]

    return AnomalyResponse(
        total_analyzed=total,
        anomalies_found=len(anomalies),
        anomaly_rate=round(len(anomalies) / max(total, 1) * 100, 2),
        critical_count=critical,
        high_count=high,
        results=[AnomalyResultItem(**r) for r in flagged],
        summary=summary,
    )