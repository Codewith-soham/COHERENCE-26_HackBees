"""
SYNTHETIC DATA GENERATOR FOR BUDGETGUARD
Run: python utils/generate_data.py
"""

import numpy as np
import pandas as pd
import json
import os

np.random.seed(42)

print("=" * 60)
print("BUDGETGUARD — GENERATING TRAINING DATA")
print("=" * 60)

DEPARTMENTS = [
    {"id": "DEPT-001", "name": "Health & Family Welfare",     "allocated": 400, "level": "central"},
    {"id": "DEPT-002", "name": "Education",                   "allocated": 300, "level": "central"},
    {"id": "DEPT-003", "name": "Road Transport & Highways",   "allocated": 350, "level": "central"},
    {"id": "DEPT-004", "name": "Agriculture & Farmers",       "allocated": 250, "level": "central"},
    {"id": "DEPT-005", "name": "Rural Development",           "allocated": 200, "level": "state"},
    {"id": "DEPT-006", "name": "Urban Development",           "allocated": 180, "level": "state"},
    {"id": "DEPT-007", "name": "Water Resources",             "allocated": 200, "level": "state"},
    {"id": "DEPT-008", "name": "Women & Child Development",   "allocated": 150, "level": "state"},
    {"id": "DEPT-009", "name": "Public Works - Pune",         "allocated": 120, "level": "district"},
    {"id": "DEPT-010", "name": "Public Works - Mumbai",       "allocated": 150, "level": "district"},
    {"id": "DEPT-011", "name": "Public Works - Nagpur",       "allocated": 100, "level": "district"},
    {"id": "DEPT-012", "name": "Primary Education - Pune",    "allocated": 80,  "level": "district"},
]

CATEGORIES = ["capital", "revenue", "grants", "subsidies", "salaries", "infrastructure"]
VENDORS = [f"Vendor-{i:03d}" for i in range(1, 51)]
MONTHS_DONE = 9

# ============ PART 1: TRANSACTIONS ============
print("\nPart 1: Generating transactions...")

all_transactions = []
txn_id = 1

for dept in DEPARTMENTS:
    dept_avg_txn = dept["allocated"] / 20
    
    # Normal transactions
    for _ in range(80):
        amount = np.random.lognormal(mean=np.log(dept_avg_txn), sigma=0.5)
        amount = round(max(0.5, min(amount, dept["allocated"] * 0.12)), 2)
        month = np.random.randint(4, 13)
        day = np.random.randint(1, 29)
        
        all_transactions.append({
            "id": f"TXN-{txn_id:05d}",
            "department": dept["name"],
            "department_id": dept["id"],
            "amount": amount,
            "date": f"2025-{month:02d}-{day:02d}",
            "month": month,
            "day": day,
            "category": np.random.choice(CATEGORIES),
            "vendor": np.random.choice(VENDORS),
            "description": "Regular departmental expenditure",
            "is_anomaly": False,
            "anomaly_type": "none",
        })
        txn_id += 1
    
    # Anomalous transactions
    for _ in range(12):
        anomaly_type = np.random.choice([
            "spending_spike", "march_dumping", "threshold_structuring",
            "round_amount_fraud", "vendor_concentration",
        ])
        
        if anomaly_type == "spending_spike":
            amount = round(dept_avg_txn * np.random.uniform(5, 15), 2)
            month = np.random.randint(4, 13)
            day = np.random.randint(1, 29)
            date = f"2025-{month:02d}-{day:02d}"
            desc = "Bulk procurement - emergency purchase"
            vendor = np.random.choice(VENDORS)
        
        elif anomaly_type == "march_dumping":
            amount = round(dept_avg_txn * np.random.uniform(3, 10), 2)
            day = min(np.random.randint(25, 32), 31)
            date = f"2026-03-{day:02d}"
            month = 3
            desc = "Urgent year-end fund utilization"
            vendor = np.random.choice(VENDORS)
        
        elif anomaly_type == "threshold_structuring":
            threshold = np.random.choice([10, 50, 100])
            amount = round(threshold - np.random.uniform(0.01, 0.5), 2)
            month = np.random.randint(4, 13)
            day = np.random.randint(1, 29)
            date = f"2025-{month:02d}-{day:02d}"
            desc = "Procurement payment - vendor invoice"
            vendor = np.random.choice(VENDORS)
        
        elif anomaly_type == "round_amount_fraud":
            amount = float(np.random.choice([50, 100, 150, 200, 250]))
            month = np.random.randint(4, 13)
            day = np.random.randint(1, 29)
            date = f"2025-{month:02d}-{day:02d}"
            desc = "Capital expenditure - project payment"
            vendor = np.random.choice(VENDORS)
        
        else:  # vendor_concentration
            amount = round(dept_avg_txn * np.random.uniform(0.8, 1.5), 2)
            month = np.random.randint(4, 13)
            day = np.random.randint(1, 29)
            date = f"2025-{month:02d}-{day:02d}"
            desc = "Repeat vendor contract payment"
            vendor = "Vendor-042"
        
        all_transactions.append({
            "id": f"TXN-{txn_id:05d}",
            "department": dept["name"],
            "department_id": dept["id"],
            "amount": amount,
            "date": date,
            "month": month,
            "day": day,
            "category": np.random.choice(CATEGORIES),
            "vendor": vendor,
            "description": desc,
            "is_anomaly": True,
            "anomaly_type": anomaly_type,
        })
        txn_id += 1

np.random.shuffle(all_transactions)

df_txn = pd.DataFrame(all_transactions)
df_txn.to_csv("data/transactions.csv", index=False)

with open("data/transactions.json", "w") as f:
    json.dump(all_transactions, f, indent=2)

total = len(all_transactions)
anomalous = sum(1 for t in all_transactions if t["is_anomaly"])
print(f"   Total: {total} | Normal: {total - anomalous} | Anomalous: {anomalous}")

for atype in ["spending_spike", "march_dumping", "threshold_structuring", "round_amount_fraud", "vendor_concentration"]:
    count = sum(1 for t in all_transactions if t["anomaly_type"] == atype)
    print(f"   {atype}: {count}")

# ============ PART 2: DEPARTMENT BUDGETS ============
print("\nPart 2: Generating department budgets...")

SPENDING_BEHAVIORS = {
    "Health & Family Welfare": "good", "Education": "good",
    "Road Transport & Highways": "good", "Agriculture & Farmers": "average",
    "Rural Development": "average", "Urban Development": "poor",
    "Water Resources": "poor", "Women & Child Development": "poor",
    "Public Works - Pune": "mixed", "Public Works - Mumbai": "average",
    "Public Works - Nagpur": "mixed", "Primary Education - Pune": "mixed",
}

department_budgets = []

for dept in DEPARTMENTS:
    behavior = SPENDING_BEHAVIORS.get(dept["name"], "average")
    monthly_budget = dept["allocated"] / 12
    monthly_spending = []
    
    for month_idx in range(MONTHS_DONE):
        if behavior == "good":
            base = monthly_budget * 0.85
            spend = base * (1 + 0.02 * month_idx) + np.random.normal(0, base * 0.08)
        elif behavior == "poor":
            base = monthly_budget * 0.45
            spend = base * (1 - 0.08 * month_idx) + np.random.normal(0, base * 0.1)
        elif behavior == "average":
            base = monthly_budget * 0.65
            spend = base + np.random.normal(0, base * 0.15)
        else:
            if np.random.random() > 0.4:
                spend = monthly_budget * np.random.uniform(0.6, 0.9)
            else:
                spend = monthly_budget * np.random.uniform(0.15, 0.4)
        
        monthly_spending.append(round(max(0.5, spend), 2))
    
    total_spent = round(sum(monthly_spending), 2)
    utilization = round((total_spent / dept["allocated"]) * 100, 2)
    
    department_budgets.append({
        "department_id": dept["id"],
        "department_name": dept["name"],
        "level": dept["level"],
        "allocated_amount": dept["allocated"],
        "spent_amount": total_spent,
        "current_month": MONTHS_DONE,
        "monthly_spending": monthly_spending,
        "utilization_rate": utilization,
        "spending_behavior": behavior,
    })

with open("data/department_budgets.json", "w") as f:
    json.dump(department_budgets, f, indent=2)

print(f"   Generated {len(department_budgets)} departments")
for dept in sorted(department_budgets, key=lambda x: x["utilization_rate"]):
    emoji = "GOOD" if dept["utilization_rate"] > 70 else "MED " if dept["utilization_rate"] > 45 else "LOW "
    print(f"   [{emoji}] {dept['department_name']:35s} {dept['spent_amount']:>7.1f}/{dept['allocated_amount']:>5.0f} Cr ({dept['utilization_rate']:>5.1f}%)")

# ============ PART 3: REALLOCATION INPUT ============
print("\nPart 3: Generating reallocation input...")

PRIORITY_SCORES = {
    "Health & Family Welfare": 9, "Education": 9,
    "Road Transport & Highways": 8, "Agriculture & Farmers": 8,
    "Rural Development": 7, "Women & Child Development": 7,
    "Water Resources": 6, "Urban Development": 5,
    "Public Works - Pune": 6, "Public Works - Mumbai": 6,
    "Public Works - Nagpur": 5, "Primary Education - Pune": 7,
}

reallocation_input = []
for dept in department_budgets:
    util = dept["utilization_rate"]
    priority = PRIORITY_SCORES.get(dept["department_name"], 5)
    
    if util > 80 and priority >= 7:
        demand = round(np.random.uniform(0.7, 0.95), 2)
    elif util > 60:
        demand = round(np.random.uniform(0.4, 0.65), 2)
    elif util > 40:
        demand = round(np.random.uniform(0.2, 0.45), 2)
    else:
        demand = round(np.random.uniform(0.05, 0.25), 2)
    
    reallocation_input.append({
        "department_id": dept["department_id"],
        "department_name": dept["department_name"],
        "allocated": dept["allocated_amount"],
        "spent": dept["spent_amount"],
        "utilization_rate": util,
        "priority_score": priority,
        "demand_indicator": demand,
    })

with open("data/reallocation_input.json", "w") as f:
    json.dump(reallocation_input, f, indent=2)

print(f"   Generated {len(reallocation_input)} department records")

print(f"\n{'=' * 60}")
print("ALL DATA GENERATED!")
print(f"{'=' * 60}")
print(f"\nFiles in data/ folder:")
print(f"   transactions.csv          — {total} transactions")
print(f"   transactions.json         — same in JSON")
print(f"   department_budgets.json   — {len(department_budgets)} departments")
print(f"   reallocation_input.json   — {len(reallocation_input)} departments")
print(f"\nNext: python train_anomaly_model.py")