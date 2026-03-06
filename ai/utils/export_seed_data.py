"""
Export seed data for Soham's MongoDB.
Run: python utils/export_seed_data.py
Output: data/mongodb_seed.json — Give this file to Soham.
"""

import json
import numpy as np
from datetime import datetime

print("=" * 50)
print("EXPORTING SEED DATA FOR MONGODB")
print("=" * 50)

with open("data/transactions.json") as f:
    transactions = json.load(f)

with open("data/department_budgets.json") as f:
    dept_budgets = json.load(f)

# ============ BUDGETS (for his Budget model) ============
budgets = []
months = ["April", "May", "June", "July", "August", "September",
          "October", "November", "December", "January", "February", "March"]

for dept in dept_budgets:
    for i, monthly_spend in enumerate(dept["monthly_spending"]):
        budgets.append({
            "department": dept["department_name"],
            "district": dept["department_name"].split(" - ")[-1] if " - " in dept["department_name"] else "All",
            "month": months[i] if i < len(months) else months[0],
            "financial_year": "2025-26",
            "allocated_amount": round(dept["allocated_amount"] / 12, 2),
            "spent_amount": round(monthly_spend, 2),
            "utilization_percentage": round((monthly_spend / (dept["allocated_amount"] / 12)) * 100, 2),
        })

print(f"  Budgets: {len(budgets)} records")

# ============ ANOMALIES (for his Anomaly model) ============
anomalies = []
for txn in transactions:
    if txn["is_anomaly"]:
        score = round(np.random.uniform(45, 95), 1)
        if score >= 70:
            severity = "HIGH"
        elif score >= 40:
            severity = "MEDIUM"
        else:
            severity = "LOW"

        anomalies.append({
            "department": txn["department"],
            "district": txn["department"].split(" - ")[-1] if " - " in txn["department"] else "All",
            "anomaly_detected": True,
            "anomaly_score": score,
            "explanation": f"Detected: {txn['anomaly_type'].replace('_', ' ')}. Amount Rs.{txn['amount']}Cr on {txn['date']}.",
            "severity": severity,
        })

print(f"  Anomalies: {len(anomalies)} records")

# ============ PREDICTIONS (for his Prediction model) ============
predictions = []
for dept in dept_budgets:
    allocated = dept["allocated_amount"]
    spent = dept["spent_amount"]
    remaining = 12 - dept["current_month"]
    avg_monthly = spent / dept["current_month"] if dept["current_month"] > 0 else 0
    projected = spent + (avg_monthly * remaining)
    unused = max(0, allocated - projected)

    util_pct = (projected / allocated * 100) if allocated > 0 else 0
    if util_pct < 50:
        risk = "HIGH"
    elif util_pct < 75:
        risk = "MEDIUM"
    else:
        risk = "LOW"

    predictions.append({
        "department": dept["department_name"],
        "district": dept["department_name"].split(" - ")[-1] if " - " in dept["department_name"] else "All",
        "financial_year": "2025-26",
        "allocated_amount": allocated,
        "projected_spending": round(projected, 2),
        "predicted_unused": round(unused, 2),
        "risk_level": risk,
        "reallocation_suggestion": f"{'Reallocate surplus funds' if risk == 'HIGH' else 'Monitor spending' if risk == 'MEDIUM' else 'On track'}. Projected utilization: {round(util_pct, 1)}%.",
    })

print(f"  Predictions: {len(predictions)} records")

# ============ SAVE ============
seed = {
    "budgets": budgets,
    "anomalies": anomalies,
    "predictions": predictions,
    "_info": {
        "generated_at": datetime.now().isoformat(),
        "instructions": "Import each array into corresponding MongoDB collection.",
    }
}

with open("data/mongodb_seed.json", "w") as f:
    json.dump(seed, f, indent=2)

print(f"\n  Saved: data/mongodb_seed.json")
print(f"\n  GIVE THIS FILE TO SOHAM.")
print(f"  He imports:")
print(f"    budgets[]     → budget collection")
print(f"    anomalies[]   → anomaly collection")
print(f"    predictions[] → prediction collection")