"""
TRAIN ANOMALY DETECTION MODEL
Run: python train_anomaly_model.py
"""

import numpy as np
import pandas as pd
import pickle
import os
from datetime import datetime
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix

print("=" * 60)
print("TRAINING ANOMALY DETECTION MODEL")
print("=" * 60)

# STEP A: Load data
print("\nStep A: Loading data...")
df = pd.read_csv("data/transactions.csv")
print(f"   Loaded {len(df)} transactions")
print(f"   Normal: {(~df['is_anomaly']).sum()} | Anomalous: {df['is_anomaly'].sum()}")

# STEP B: Extract features
print("\nStep B: Extracting features...")

features = pd.DataFrame()
features['amount'] = df['amount']
features['amount_log'] = np.log1p(df['amount'])
features['day'] = df['day']
features['month'] = df['month']
features['is_round'] = ((df['amount'] >= 50) & (df['amount'] % 50 == 0)).astype(int)
features['is_march'] = (df['month'] == 3).astype(int)
features['is_month_end'] = (df['day'] >= 25).astype(int)

def check_threshold(amount):
    for threshold in [10, 50, 100]:
        if threshold * 0.90 <= amount < threshold:
            return 1
    return 0

features['near_threshold'] = df['amount'].apply(check_threshold)

dept_mapping = {name: idx for idx, name in enumerate(df['department'].unique())}
features['dept_code'] = df['department'].map(dept_mapping)

print(f"   Features: {list(features.columns)}")
print(f"   Shape: {features.shape}")

# STEP C: Normalize
print("\nStep C: Normalizing features...")
scaler = StandardScaler()
X_scaled = scaler.fit_transform(features)
print(f"   Done. Mean ~0, Std ~1 for all features.")

# STEP D: Train
print("\nStep D: Training Isolation Forest...")
model = IsolationForest(
    contamination=0.13,
    n_estimators=150,
    max_samples='auto',
    random_state=42,
    n_jobs=-1,
)
model.fit(X_scaled)
print(f"   Model trained with 150 trees!")

# STEP E: Evaluate
print("\nStep E: Evaluating...")
raw_predictions = model.predict(X_scaled)
predicted_anomaly = raw_predictions == -1
true_anomaly = df['is_anomaly'].values

cm = confusion_matrix(true_anomaly, predicted_anomaly)
tn, fp, fn, tp = cm.ravel()

print(f"\n   Confusion Matrix:")
print(f"                     Predicted Normal   Predicted Anomaly")
print(f"   Actual Normal:    {tn:>8}           {fp:>8}")
print(f"   Actual Anomaly:   {fn:>8}           {tp:>8}")

precision = tp / (tp + fp) if (tp + fp) > 0 else 0
recall = tp / (tp + fn) if (tp + fn) > 0 else 0
f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0

print(f"\n   Precision: {precision:.1%}")
print(f"   Recall:    {recall:.1%}")
print(f"   F1-Score:  {f1:.1%}")

print(f"\n   Detection by anomaly type:")
for atype in ["spending_spike", "march_dumping", "threshold_structuring", "round_amount_fraud", "vendor_concentration"]:
    mask = df['anomaly_type'] == atype
    if mask.sum() > 0:
        caught = predicted_anomaly[mask].sum()
        total_type = mask.sum()
        rate = caught / total_type * 100
        status = "GOOD" if rate >= 60 else "WEAK" if rate >= 40 else "POOR"
        print(f"   [{status}] {atype:30s} {caught}/{total_type} ({rate:.0f}%)")

# STEP F: Save
print("\nStep F: Saving model...")
os.makedirs("trained_models", exist_ok=True)

model_package = {
    "model": model,
    "scaler": scaler,
    "feature_columns": list(features.columns),
    "trained_at": datetime.now().isoformat(),
    "training_samples": len(df),
    "version": "1.0.0",
}

with open("trained_models/anomaly_model.pkl", "wb") as f:
    pickle.dump(model_package, f)

file_size = os.path.getsize("trained_models/anomaly_model.pkl") / 1024
print(f"   Saved: trained_models/anomaly_model.pkl ({file_size:.0f} KB)")

# Verify
with open("trained_models/anomaly_model.pkl", "rb") as f:
    loaded = pickle.load(f)
test_pred = loaded["model"].predict(X_scaled[:3])
print(f"   Verification: {test_pred} — Model loads correctly!")

print(f"\n{'=' * 60}")
print(f"ANOMALY MODEL TRAINING COMPLETE!")
print(f"   Precision: {precision:.1%} | Recall: {recall:.1%} | F1: {f1:.1%}")
print(f"{'=' * 60}")
print(f"\nNext: python train_lapse_model.py")