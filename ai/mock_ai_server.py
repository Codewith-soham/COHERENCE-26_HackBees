
ENDPOINT 1: POST /ai/anomaly-check
REQUEST (what you send me):
{
  "department": "Education",
  "district": "Pune",
  "month": "January",
  "financial_year": "2025-26",
  "allocated_amount": 5000000,
  "spent_amount": 4200000,
  "utilization_percentage": 84
}

RESPONSE (what I return):
{
  "anomaly_detected": true,
  "anomaly_score": 72.5,
  "severity": "HIGH",
  "explanation": "Amount is 2.3x the department average; March transaction — year-end budget dumping risk"
}

ENDPOINT 2: POST /ai/predict-utilization
REQUEST (what you send me):
{
  "department": "Water Resources",
  "district": "Pune",
  "financial_year": "2025-26",
  "allocated_amount": 20000000,
  "current_spent": 5600000,
  "month": "December"
}

RESPONSE (what I return):
{
  "projected_spending": 7466666.67,
  "predicted_unused": 12533333.33,
  "risk_level": "HIGH",
  "reallocation_suggestion": "Water Resources is projected to underutilize 62.7% of allocated funds. CRITICAL: Fast-track pending project approvals."
}

My AI server URL: http://localhost:8000