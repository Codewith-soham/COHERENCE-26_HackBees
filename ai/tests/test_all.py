"""
Run all tests: python tests/test_all.py
Make sure server is running first: python main.py
"""

import requests
import sys

BASE = "http://localhost:8000"
passed = 0
failed = 0


def test(name, method, url, json_data=None, check_field=None):
    global passed, failed
    try:
        if method == "GET":
            r = requests.get(url, timeout=10)
        else:
            r = requests.post(url, json=json_data, timeout=10)

        if r.status_code == 200:
            data = r.json()
            if check_field and check_field not in data:
                print(f"  FAIL {name} — missing field '{check_field}'")
                failed += 1
            else:
                print(f"  PASS {name}")
                passed += 1
        else:
            print(f"  FAIL {name} — status {r.status_code}: {r.text[:100]}")
            failed += 1
    except requests.ConnectionError:
        print(f"  FAIL {name} — Cannot connect. Is server running?")
        failed += 1
    except Exception as e:
        print(f"  FAIL {name} — {str(e)[:100]}")
        failed += 1


print("=" * 50)
print("TESTING BUDGETGUARD AI SERVICE")
print("=" * 50)

# Test 1: Health
test("Health Check", "GET", f"{BASE}/ai/health", check_field="status")

# Test 2: Anomaly Check (Soham's format)
test("Anomaly Check (Backend)", "POST", f"{BASE}/ai/anomaly-check", {
    "department": "Education", "district": "Pune", "month": "March",
    "financial_year": "2025-26", "allocated_amount": 5000000,
    "spent_amount": 4200000, "utilization_percentage": 84
}, check_field="anomaly_detected")

# Test 3: Predict Utilization (Soham's format)
test("Predict Utilization (Backend)", "POST", f"{BASE}/ai/predict-utilization", {
    "department": "Water Resources", "district": "Pune",
    "financial_year": "2025-26", "allocated_amount": 20000000,
    "current_spent": 5600000, "month": "December"
}, check_field="projected_spending")

# Test 4: Detect Anomalies (Advanced)
test("Detect Anomalies (Advanced)", "POST", f"{BASE}/ai/detect-anomalies", {
    "transactions": [
        {"id": "T1", "department": "Health", "amount": 25, "date": "2025-07-15"},
        {"id": "T2", "department": "Health", "amount": 18, "date": "2025-08-10"},
        {"id": "T3", "department": "Water", "amount": 450, "date": "2026-03-28"},
    ]
}, check_field="anomalies_found")

# Test 5: Predict Lapse (Advanced)
test("Predict Lapse (Advanced)", "POST", f"{BASE}/ai/predict-lapse", {
    "departments": [{
        "department_id": "D1", "department_name": "Water",
        "allocated_amount": 200, "spent_amount": 56,
        "current_month": 9, "monthly_spending": [10, 8, 7, 6, 5, 6, 5, 5, 4]
    }]
}, check_field="predictions")

# Test 6: Reallocation (Advanced)
test("Suggest Reallocation", "POST", f"{BASE}/ai/suggest-reallocation", {
    "departments": [
        {"department_id": "D1", "department_name": "Health", "allocated": 400, "spent": 350, "utilization_rate": 87, "priority_score": 9, "demand_indicator": 0.8},
        {"department_id": "D2", "department_name": "Water", "allocated": 200, "spent": 56, "utilization_rate": 28, "priority_score": 6, "demand_indicator": 0.2},
    ]
}, check_field="suggestions")

# Test 7: Real-time Entry
test("Analyze New Entry", "POST", f"{BASE}/ai/analyze-new-entry", {
    "date": "2026-03-28", "department_id": "D1", "department_name": "Water",
    "amount": 450, "category": "capital", "vendor": "XYZ",
    "department_allocated": 200, "department_spent_before": 56,
    "department_monthly_spending": [10, 8, 7, 6, 5, 6, 5, 5, 4], "current_month": 9
}, check_field="status")

# Results
print(f"\n{'=' * 50}")
print(f"RESULTS: {passed} passed, {failed} failed out of {passed + failed}")
print(f"{'=' * 50}")

if failed > 0:
    print("FIX FAILURES BEFORE INTEGRATION!")
    sys.exit(1)
else:
    print("ALL TESTS PASSED! Ready for integration.")
    sys.exit(0)