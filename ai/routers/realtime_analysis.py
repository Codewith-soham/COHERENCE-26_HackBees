from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

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

# Import all routers
from routers import backend_bridge, anomaly, lapse_prediction, reallocation, realtime_analysis

# PRIORITY: Backend bridge (what Soham's backend calls)
app.include_router(backend_bridge.router, prefix="/ai", tags=["Backend Bridge (Soham's API)"])

# Advanced endpoints
app.include_router(anomaly.router, prefix="/ai", tags=["Anomaly Detection (Advanced)"])
app.include_router(lapse_prediction.router, prefix="/ai", tags=["Lapse Prediction (Advanced)"])
app.include_router(reallocation.router, prefix="/ai", tags=["Reallocation"])
app.include_router(realtime_analysis.router, prefix="/ai", tags=["Real-time Entry Analysis"])

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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)