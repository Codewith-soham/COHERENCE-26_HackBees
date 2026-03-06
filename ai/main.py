"""
BudgetGuard AI Service — Main Entry Point
==========================================
This is the ONLY file that imports app and registers routers.
No router file should import app or call app.include_router().
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# ============ Create App ============
app = FastAPI(
    title="BudgetGuard AI Service",
    description="AI-powered budget analysis for government fund tracking",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ Import Routers ============
from routers.backend_bridge import router as backend_bridge_router
from routers.anomaly import router as anomaly_router
from routers.lapse_prediction import router as lapse_prediction_router
from routers.reallocation import router as reallocation_router
from routers.realtime_analysis import router as realtime_analysis_router

# ============ Register Routers (ONLY HERE) ============
app.include_router(backend_bridge_router, prefix="/ai", tags=["Backend Bridge"])
app.include_router(anomaly_router, prefix="/ai", tags=["Anomaly Detection"])
app.include_router(lapse_prediction_router, prefix="/ai", tags=["Lapse Prediction"])
app.include_router(reallocation_router, prefix="/ai", tags=["Reallocation"])
app.include_router(realtime_analysis_router, prefix="/ai", tags=["Real-time Analysis"])

# ============ Health Check ============
@app.get("/ai/health")
async def health():
    return {
        "status": "running",
        "service": "BudgetGuard AI",
        "backend_endpoints": [
            "POST /ai/anomaly-check",
            "POST /ai/predict-utilization",
        ],
        "advanced_endpoints": [
            "POST /ai/detect-anomalies",
            "POST /ai/predict-lapse",
            "POST /ai/suggest-reallocation",
            "POST /ai/analyze-new-entry",
        ]
    }

# ============ Run ============
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)