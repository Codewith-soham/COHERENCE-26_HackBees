"""
TRAIN LAPSE RISK CLASSIFIER
Run: python train_lapse_model.py
"""

import numpy as np
import pandas as pd
import pickle
import os
import json
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from datetime import datetime

print("=" * 60)
print("TRAINING LAPSE RISK CLASSIFIER")
print("=" * 60)

np.random.seed(42)

# STEP A: Generate training examples
print("\nStep A: Generating 2000 training examples...")

examples = []
for i in range(2000):
    allocated = np.random.uniform(50, 500)
    months_done = np.random.randint(3, 11)
    months_remaining = 12 - months_done
    monthly_budget = allocated / 12
    
    behavior = np.random.choice(["good", "poor", "average", "erratic"], p=[0.3, 0.25, 0.3, 0.15])
    
    monthly = []
    for m in range(months_done):
        if behavior == "good":
            spend = monthly_budget * 0.85 * (1 + 0.01 * m) + np.random.normal(0, monthly_budget * 0.05)
        elif behavior == "poor":
            spend = monthly_budget * 0.4 * (1 - 0.06 * m) + np.random.normal(0, monthly_budget * 0.08)
        elif behavior == "average":
            spend = monthly_budget * 0.6 + np.random.normal(0, monthly_budget * 0.12)
        else:
            spend = monthly_budget * np.random.uniform(0.1, 0.9)
        monthly.append(max(0.1, spend))
    
    monthly = np.array(monthly)
    total_spent = float(np.sum(monthly))
    utilization = (total_spent / allocated) * 100
    
    if len(monthly) >= 2:
        x = np.arange(len(monthly))
        n = len(x)
        trend = float((n * np.sum(x * monthly) - np.sum(x) * np.sum(monthly)) / (n * np.sum(x**2) - np.sum(x)**2 + 1e-10))
    else:
        trend = 0
    
    volatility = float(np.std(monthly) / (np.mean(monthly) + 1e-10))
    recent = monthly[-3:] if len(monthly) >= 3 else monthly
    avg_recent = float(np.mean(recent))
    
    if len(monthly) >= 4:
        first_half = np.mean(monthly[:len(monthly)//2])
        second_half = np.mean(monthly[len(monthly)//2:])
        acceleration = float((second_half - first_half) / (first_half + 1e-10))
    else:
        acceleration = 0
    
    projected = total_spent + avg_recent * months_remaining
    lapse_pct = max(0, (1 - projected / allocated) * 100)
    
    if lapse_pct >= 40: label = 3
    elif lapse_pct >= 25: label = 2
    elif lapse_pct >= 10: label = 1
    else: label = 0
    
    examples.append({
        "utilization_rate": round(utilization, 2),
        "months_remaining": months_remaining,
        "spending_trend": round(trend, 4),
        "spending_volatility": round(volatility, 4),
        "avg_recent_spending": round(avg_recent, 2),
        "acceleration": round(acceleration, 4),
        "allocated_amount": round(allocated, 2),
        "label": label,
    })

df = pd.DataFrame(examples)
label_names = {0: "Low", 1: "Medium", 2: "High", 3: "Critical"}

print(f"   Generated {len(df)} examples")
for label, count in df['label'].value_counts().sort_index().items():
    print(f"   {label_names[label]:10s}: {count}")

# STEP B: Prepare features
print("\nStep B: Preparing features...")
feature_columns = ["utilization_rate", "months_remaining", "spending_trend",
                    "spending_volatility", "avg_recent_spending", "acceleration", "allocated_amount"]

X = df[feature_columns].values
y = df['label'].values

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
print(f"   Train: {len(X_train)} | Test: {len(X_test)}")

# STEP C: Train
print("\nStep C: Training Random Forest...")
model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)
model.fit(X_train, y_train)
print(f"   Trained with 100 trees!")

# STEP D: Evaluate
print("\nStep D: Evaluating...")
y_pred = model.predict(X_test)
accuracy = (y_pred == y_test).mean()

print(classification_report(y_test, y_pred, target_names=["Low", "Medium", "High", "Critical"]))
print(f"   Overall Accuracy: {accuracy:.1%}")

print(f"\n   Feature Importance:")
for feat, imp in sorted(zip(feature_columns, model.feature_importances_), key=lambda x: x[1], reverse=True):
    bar = "#" * int(imp * 40)
    print(f"   {feat:25s} {bar} ({imp:.3f})")

# STEP E: Save
print("\nStep E: Saving model...")
os.makedirs("trained_models", exist_ok=True)

with open("trained_models/lapse_classifier.pkl", "wb") as f:
    pickle.dump({
        "model": model,
        "feature_columns": feature_columns,
        "label_names": label_names,
        "trained_at": datetime.now().isoformat(),
        "accuracy": float(accuracy),
    }, f)

file_size = os.path.getsize("trained_models/lapse_classifier.pkl") / 1024
print(f"   Saved: trained_models/lapse_classifier.pkl ({file_size:.0f} KB)")

# STEP F: Test with real department data
print("\nStep F: Testing with real departments...")
with open("data/department_budgets.json") as f:
    dept_budgets = json.load(f)

for dept in dept_budgets:
    monthly = np.array(dept["monthly_spending"])
    allocated = dept["allocated_amount"]
    months_remaining = 12 - dept["current_month"]
    utilization = dept["utilization_rate"]
    
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
    
    feat = np.array([[utilization, months_remaining, trend, volatility, avg_recent, acceleration, allocated]])
    risk_label = model.predict(feat)[0]
    confidence = model.predict_proba(feat)[0][risk_label] * 100
    
    status = label_names[risk_label]
    print(f"   {dept['department_name']:35s} -> {status:10s} ({confidence:.0f}%) [{dept['spending_behavior']}]")

print(f"\n{'=' * 60}")
print(f"LAPSE MODEL TRAINING COMPLETE! (Accuracy: {accuracy:.1%})")
print(f"{'=' * 60}")