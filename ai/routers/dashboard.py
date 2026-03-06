"""
Dashboard Analytics — Summary stats for frontend dashboard cards and charts.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import json
import os
import numpy as np

router = APIRouter()


@router.get("/dashboard/summary")
async def dashboard_summary():
    """One API call → All data needed for dashboard stat cards and charts"""

    # Load department data
    data_path = "data/department_budgets.json"
    if not os.path.exists(data_path):
        return {"error": "No department data found. Run: python utils/generate_data.py"}

    with open(data_path) as f:
        departments = json.load(f)

    total_allocated = sum(d['allocated_amount'] for d in departments)
    total_spent = sum(d['spent_amount'] for d in departments)
    overall_util = (total_spent / total_allocated * 100) if total_allocated > 0 else 0

    # Risk classification
    critical = []
    high_risk = []
    on_track = []

    for d in departments:
        util = d['utilization_rate']
        entry = {
            "name": d['department_name'],
            "allocated": d['allocated_amount'],
            "spent": d['spent_amount'],
            "utilization": util,
            "level": d['level'],
        }
        if util < 35:
            critical.append(entry)
        elif util < 55:
            high_risk.append(entry)
        else:
            on_track.append(entry)

    # Monthly trend (aggregate all departments)
    months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    monthly_totals = []
    for i in range(min(9, len(departments[0].get('monthly_spending', [])))):
        month_total = sum(d['monthly_spending'][i] for d in departments if i < len(d['monthly_spending']))
        monthly_totals.append({
            "month": months[i] if i < len(months) else f"M{i+1}",
            "spent": round(month_total, 2),
            "target": round(total_allocated / 12, 2),
        })

    # Department comparison (for bar chart)
    dept_comparison = sorted(
        [{"name": d['department_name'], "allocated": d['allocated_amount'],
          "spent": d['spent_amount'], "utilization": d['utilization_rate']}
         for d in departments],
        key=lambda x: x['utilization'],
        reverse=True
    )

    # Spending velocity
    velocities = []
    for d in departments:
        monthly = d.get('monthly_spending', [])
        if len(monthly) >= 3:
            recent_avg = float(np.mean(monthly[-3:]))
            overall_avg = float(np.mean(monthly))
            velocity = "accelerating" if recent_avg > overall_avg * 1.1 else "declining" if recent_avg < overall_avg * 0.9 else "steady"
        else:
            velocity = "insufficient_data"
        velocities.append({
            "department": d['department_name'],
            "velocity": velocity,
            "recent_avg": round(float(np.mean(monthly[-3:])), 2) if len(monthly) >= 3 else 0,
        })

    return {
        # Stat cards
        "stat_cards": {
            "total_allocated": round(total_allocated, 2),
            "total_spent": round(total_spent, 2),
            "overall_utilization": round(overall_util, 2),
            "departments_tracked": len(departments),
            "critical_departments": len(critical),
            "potential_lapse": round(total_allocated - total_spent, 2),
        },

        # Risk breakdown
        "risk_distribution": {
            "critical": len(critical),
            "high_risk": len(high_risk),
            "on_track": len(on_track),
        },
        "critical_departments": critical,
        "high_risk_departments": high_risk,

        # Charts data
        "monthly_trend": monthly_totals,
        "department_comparison": dept_comparison,
        "spending_velocities": velocities,

        # AI insight (one-liner for dashboard)
        "ai_insight": (
            f"{len(critical)} departments at CRITICAL risk. "
            f"Rs.{round(total_allocated - total_spent, 0)}Cr potentially unspent. "
            f"{'Immediate reallocation recommended.' if len(critical) > 0 else 'All departments on track.'}"
        ),
    }