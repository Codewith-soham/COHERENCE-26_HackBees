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
from routers.backend_bridge import router as backend_bridge_router
from routers.anomaly import router as anomaly_router
from routers.lapse_prediction import router as lapse_prediction_router
from routers.reallocation import router as reallocation_router
from routers.realtime_analysis import router as realtime_analysis_router
from routers.demo import router as demo_router
from routers.explainability import router as explainability_router
from routers.dashboard import router as dashboard_router

# Register all routers (ONLY HERE)
app.include_router(backend_bridge_router, prefix="/ai", tags=["Backend Bridge"])
app.include_router(anomaly_router, prefix="/ai", tags=["Anomaly Detection"])
app.include_router(lapse_prediction_router, prefix="/ai", tags=["Lapse Prediction"])
app.include_router(reallocation_router, prefix="/ai", tags=["Reallocation"])
app.include_router(realtime_analysis_router, prefix="/ai", tags=["Real-time Analysis"])
app.include_router(demo_router, prefix="/ai", tags=["Demo Data"])
app.include_router(explainability_router, prefix="/ai", tags=["AI Explainability"])
app.include_router(dashboard_router, prefix="/ai", tags=["Dashboard Analytics"])

@app.get("/ai/health")
async def health():
    return {
        "status": "running",
        "service": "BudgetGuard AI",
        "total_endpoints": 15,
        "backend_endpoints": [
            "POST /ai/anomaly-check",
            "POST /ai/predict-utilization",
        ],
        "advanced_endpoints": [
            "POST /ai/detect-anomalies",
            "POST /ai/predict-lapse",
            "POST /ai/suggest-reallocation",
            "POST /ai/analyze-new-entry",
        ],
        "dashboard_endpoints": [
            "GET /ai/dashboard/summary",
            "GET /ai/demo/anomalies",
            "GET /ai/demo/predictions",
            "GET /ai/demo/reallocation",
            "GET /ai/demo/dashboard",
        ],
        "explainability_endpoints": [
            "GET /ai/explain/anomaly-model",
            "GET /ai/explain/lapse-model",
            "GET /ai/explain/how-it-works",
        ],
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)