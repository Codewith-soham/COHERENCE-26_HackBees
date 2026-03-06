"""
Demo endpoints — Pre-computed results for reliable demo
If ML models crash, these still work perfectly.
"""

from fastapi import APIRouter

router = APIRouter()


# Pre-computed impressive results
DEMO_ANOMALIES = {
    "total_analyzed": 1104,
    "anomalies_found": 47,
    "anomaly_rate": 4.3,
    "critical_count": 3,
    "high_count": 8,
    "results": [
        {
            "transaction_id": "TXN-00847",
            "department": "Water Resources",
            "amount": 450.0,
            "date": "2026-03-28",
            "anomaly_score": 0.94,
            "is_anomaly": True,
            "ml_score": 0.91,
            "rule_score": 0.85,
            "reasons": [
                "Amount Rs.450Cr is 12.3x the department average (Rs.36.6Cr)",
                "Last week of March — highest fraud risk period",
                "Marked 'urgent' — may bypass normal approval process"
            ],
            "severity": "critical"
        },
        {
            "transaction_id": "TXN-01203",
            "department": "Rural Development",
            "amount": 200.0,
            "date": "2026-03-30",
            "anomaly_score": 0.89,
            "is_anomaly": True,
            "ml_score": 0.85,
            "rule_score": 0.80,
            "reasons": [
                "Suspiciously round amount: Rs.200Cr",
                "March 30 — second-to-last day of financial year",
                "Amount is 6.8x the department average"
            ],
            "severity": "critical"
        },
        {
            "transaction_id": "TXN-00562",
            "department": "Public Works - Pune",
            "amount": 9.99,
            "date": "2025-09-10",
            "anomaly_score": 0.72,
            "is_anomaly": True,
            "ml_score": 0.65,
            "rule_score": 0.70,
            "reasons": [
                "Just below Rs.10Cr audit threshold — possible structuring",
                "12 similar payments to same vendor detected"
            ],
            "severity": "high"
        },
    ],
    "summary": "ALERT: 3 CRITICAL anomalies detected! Rs.450Cr single transaction on March 28 — classic year-end fund dumping."
}

DEMO_PREDICTIONS = {
    "total_departments": 12,
    "critical_count": 3,
    "high_risk_count": 4,
    "total_potential_lapse": 680.0,
    "avg_utilization": 58.2,
    "predictions": [
        {
            "department_id": "DEPT-008",
            "department_name": "Women & Child Development",
            "allocated": 150.0,
            "spent_so_far": 38.0,
            "predicted_final_spending": 52.0,
            "predicted_lapse_amount": 98.0,
            "lapse_risk_pct": 65.3,
            "predicted_utilization_pct": 34.7,
            "risk_level": "critical",
            "monthly_forecast": [3.2, 2.8, 2.5],
            "recommendation": "CRITICAL: WCD projected to leave Rs.98Cr unused. Fast-track pending approvals. Reallocate Rs.58.8Cr."
        },
        {
            "department_id": "DEPT-007",
            "department_name": "Water Resources",
            "allocated": 200.0,
            "spent_so_far": 56.0,
            "predicted_final_spending": 70.0,
            "predicted_lapse_amount": 130.0,
            "lapse_risk_pct": 65.0,
            "predicted_utilization_pct": 35.0,
            "risk_level": "critical",
            "monthly_forecast": [4.5, 4.0, 3.5],
            "recommendation": "CRITICAL: Water Resources projected to leave Rs.130Cr unused. Spending declined 40% in last 3 months."
        },
    ],
    "summary": "3 departments at CRITICAL risk. Rs.680Cr projected unspent."
}

DEMO_REALLOCATION = {
    "total_suggestions": 3,
    "total_reallocatable": 190.0,
    "before_avg_utilization": 58.2,
    "after_avg_utilization": 74.8,
    "suggestions": [
        {
            "from_department": "Water Resources",
            "to_department": "Education",
            "transfer_amount": 80.0,
            "reason": "Water has Rs.144Cr surplus. Education needs funds for mid-day meal scheme — 1.2 crore children.",
            "impact_score": 0.87
        },
        {
            "from_department": "Women & Child Development",
            "to_department": "Health",
            "transfer_amount": 60.0,
            "reason": "WCD spending declining. Health needs funds for polio vaccine drive — 50 lakh children.",
            "impact_score": 0.82
        },
        {
            "from_department": "Urban Development",
            "to_department": "Road Transport",
            "transfer_amount": 50.0,
            "reason": "Urban Dev stalled. Roads need funds for highway expansion 3 months behind schedule.",
            "impact_score": 0.71
        },
    ],
    "summary": "Rs.190Cr redistributed. Utilization: 58.2% -> 74.8%. Rs.500Cr saved for citizens."
}


@router.get("/demo/anomalies")
async def demo_anomalies():
    return DEMO_ANOMALIES

@router.get("/demo/predictions")
async def demo_predictions():
    return DEMO_PREDICTIONS

@router.get("/demo/reallocation")
async def demo_reallocation():
    return DEMO_REALLOCATION

@router.get("/demo/dashboard")
async def demo_dashboard():
    return {
        "total_allocated": 2480,
        "total_spent": 1643,
        "overall_utilization": 66.3,
        "departments_tracked": 12,
        "active_alerts": 12,
        "critical_alerts": 3,
        "anomalies_detected": 47,
        "departments_at_risk": 4,
        "potential_lapse_amount": 680,
        "reallocation_possible": 190,
        "top_risk_departments": [
            {"name": "Women & Child Development", "risk": 65.3, "lapse": 98},
            {"name": "Water Resources", "risk": 65.0, "lapse": 130},
            {"name": "Urban Development", "risk": 52.0, "lapse": 95},
        ],
        "top_performers": [
            {"name": "Health & Family Welfare", "utilization": 87.2},
            {"name": "Education", "utilization": 85.5},
            {"name": "Road Transport & Highways", "utilization": 82.1},
        ],
        "ai_insight": "3 departments at CRITICAL risk of fund lapse. Rs.680Cr projected unspent. AI recommends reallocating Rs.190Cr to improve overall utilization from 58% to 75%.",
    }