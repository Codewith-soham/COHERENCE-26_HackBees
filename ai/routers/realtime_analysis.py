"""POST /ai/analyze-new-entry — Real-time field officer entry analysis"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
from datetime import datetime

router = APIRouter()


class NewEntryRequest(BaseModel):
    date: str
    department_id: str
    department_name: str
    district: Optional[str] = ""
    amount: float
    category: str
    vendor: str
    description: Optional[str] = ""
    submitted_by: Optional[str] = ""
    department_allocated: float
    department_spent_before: float
    department_monthly_spending: List[float]
    current_month: int

class AnomalyCheck(BaseModel):
    is_anomaly: bool
    anomaly_score: float
    severity: str
    reasons: List[str]

class LapseUpdate(BaseModel):
    risk_before: float
    risk_after: float
    risk_change: float
    risk_level_before: str
    risk_level_after: str
    improved: bool

class AlertGenerated(BaseModel):
    should_alert: bool
    alert_type: Optional[str] = None
    alert_severity: Optional[str] = None
    alert_title: Optional[str] = None
    alert_description: Optional[str] = None

class NewEntryResponse(BaseModel):
    status: str
    anomaly_check: AnomalyCheck
    lapse_update: LapseUpdate
    alert: AlertGenerated
    dashboard_updates: dict
    message: str


@router.post("/analyze-new-entry", response_model=NewEntryResponse)
async def analyze_new_entry(entry: NewEntryRequest):

    anomaly_result = _check_entry_anomaly(entry)
    lapse_result = _update_lapse_risk(entry)
    alert_result = _check_alert_needed(entry, anomaly_result, lapse_result)

    new_total_spent = entry.department_spent_before + entry.amount
    new_utilization = (new_total_spent / entry.department_allocated * 100) if entry.department_allocated > 0 else 0

    dashboard_updates = {
        "department_name": entry.department_name,
        "new_total_spent": round(new_total_spent, 2),
        "new_utilization_rate": round(new_utilization, 2),
        "old_utilization_rate": round(
            (entry.department_spent_before / entry.department_allocated * 100)
            if entry.department_allocated > 0 else 0, 2
        ),
        "lapse_risk_changed": abs(lapse_result.risk_change) > 1,
        "overall_impact": "positive" if lapse_result.improved else "neutral",
    }

    if anomaly_result.is_anomaly and anomaly_result.severity in ["critical", "high"]:
        status = "flagged"
        message = (
            f"Entry FLAGGED: Rs.{entry.amount}Cr to {entry.department_name} "
            f"has anomaly score {anomaly_result.anomaly_score}. "
            f"Reason: {anomaly_result.reasons[0]}. Sent to senior officers for review."
        )
    elif anomaly_result.is_anomaly:
        status = "accepted"
        message = (
            f"Entry accepted with minor flag: Rs.{entry.amount}Cr recorded. "
            f"Department utilization: {round(new_utilization, 1)}%. "
            f"Note: {anomaly_result.reasons[0]}"
        )
    else:
        status = "accepted"
        message = (
            f"Entry accepted: Rs.{entry.amount}Cr recorded for {entry.department_name}. "
            f"Department utilization updated: {round(new_utilization, 1)}%. "
            f"Lapse risk: {lapse_result.risk_level_after}."
        )

    return NewEntryResponse(
        status=status,
        anomaly_check=anomaly_result,
        lapse_update=lapse_result,
        alert=alert_result,
        dashboard_updates=dashboard_updates,
        message=message,
    )


def _check_entry_anomaly(entry: NewEntryRequest) -> AnomalyCheck:
    score = 0.0
    reasons = []

    monthly = entry.department_monthly_spending
    dept_monthly_avg = float(np.mean(monthly)) if len(monthly) > 0 else entry.department_allocated / 12
    avg_txn = dept_monthly_avg / 5 if dept_monthly_avg > 0 else 1

    if avg_txn > 0 and entry.amount > avg_txn * 3:
        factor = round(entry.amount / avg_txn, 1)
        score += 0.3
        reasons.append(f"Amount Rs.{entry.amount}Cr is {factor}x the typical transaction for {entry.department_name}")

    try:
        date = datetime.strptime(entry.date, '%Y-%m-%d')
        if date.month == 3:
            score += 0.25
            reasons.append("March transaction — year-end budget utilization rush period")
            if date.day >= 25:
                score += 0.15
                reasons.append("Last week of March — peak risk for fraudulent disbursements")
    except ValueError:
        pass

    if entry.amount >= 50 and entry.amount % 50 == 0:
        score += 0.15
        reasons.append(f"Suspiciously round amount: Rs.{entry.amount}Cr")

    for threshold in [10, 50, 100]:
        if threshold * 0.90 <= entry.amount < threshold:
            score += 0.2
            reasons.append(f"Amount Rs.{entry.amount}Cr is just below Rs.{threshold}Cr audit threshold")

    desc = (entry.description or "").lower()
    if "urgent" in desc or "emergency" in desc:
        score += 0.1
        reasons.append("Marked as urgent/emergency — may bypass normal approval workflow")

    if dept_monthly_avg > 0 and entry.amount > dept_monthly_avg * 0.8:
        score += 0.2
        reasons.append(f"Single entry is {round(entry.amount/dept_monthly_avg*100)}% of typical monthly spending")

    score = min(1.0, score)
    if not reasons:
        reasons.append("No anomaly indicators detected — entry appears normal")

    if score >= 0.75:
        severity = "critical"
    elif score >= 0.55:
        severity = "high"
    elif score >= 0.35:
        severity = "medium"
    else:
        severity = "low"

    return AnomalyCheck(is_anomaly=score > 0.5, anomaly_score=round(score, 3), severity=severity, reasons=reasons)


def _update_lapse_risk(entry: NewEntryRequest) -> LapseUpdate:
    allocated = entry.department_allocated
    spent_before = entry.department_spent_before
    spent_after = spent_before + entry.amount
    monthly = entry.department_monthly_spending
    remaining_months = 12 - entry.current_month

    def calc_risk(spent, monthly_data, remaining):
        if len(monthly_data) > 0 and remaining > 0:
            recent = monthly_data[-3:] if len(monthly_data) >= 3 else monthly_data
            weights = np.array([0.2, 0.3, 0.5])[:len(recent)]
            weights = weights / weights.sum()
            avg = float(np.average(recent, weights=weights))
            projected = spent + (avg * remaining)
            return max(0, (1 - projected / allocated) * 100) if allocated > 0 else 0
        return max(0, (1 - spent / allocated) * 100) if allocated > 0 else 0

    risk_before = calc_risk(spent_before, monthly, remaining_months)

    updated_monthly = list(monthly)
    if len(updated_monthly) > 0:
        updated_monthly[-1] = updated_monthly[-1] + entry.amount
    else:
        updated_monthly = [entry.amount]
    risk_after = calc_risk(spent_after, updated_monthly, remaining_months)

    def get_level(risk):
        if risk >= 40: return "critical"
        if risk >= 25: return "high"
        if risk >= 10: return "medium"
        return "low"

    change = risk_after - risk_before

    return LapseUpdate(
        risk_before=round(risk_before, 2), risk_after=round(risk_after, 2),
        risk_change=round(change, 2),
        risk_level_before=get_level(risk_before), risk_level_after=get_level(risk_after),
        improved=change < 0,
    )


def _check_alert_needed(entry, anomaly, lapse):
    if anomaly.is_anomaly and anomaly.severity in ["critical", "high"]:
        return AlertGenerated(
            should_alert=True, alert_type="anomaly", alert_severity=anomaly.severity,
            alert_title=f"Suspicious entry: Rs.{entry.amount}Cr — {entry.department_name}",
            alert_description=f"Anomaly score: {anomaly.anomaly_score}. {'; '.join(anomaly.reasons[:2])}. Vendor: {entry.vendor}.",
        )

    if lapse.risk_level_before != lapse.risk_level_after:
        if lapse.improved:
            return AlertGenerated(
                should_alert=True, alert_type="lapse-risk", alert_severity="low",
                alert_title=f"{entry.department_name} risk improved: {lapse.risk_level_before} -> {lapse.risk_level_after}",
                alert_description=f"Lapse risk improved from {lapse.risk_before}% to {lapse.risk_after}%.",
            )
        else:
            return AlertGenerated(
                should_alert=True, alert_type="lapse-risk", alert_severity="high",
                alert_title=f"{entry.department_name} risk worsened: {lapse.risk_level_before} -> {lapse.risk_level_after}",
                alert_description=f"Lapse risk increased to {lapse.risk_after}%.",
            )

    return AlertGenerated(should_alert=False)