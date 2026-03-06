from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(
    title="BudgetGuard AI Service",
    description="Anomaly Detection, Lapse Prediction, Reallocation & Real-time Analysis",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# We'll add routers later. For now, just health check.

@app.get("/ai/health")
async def health():
    return {
        "status": "running",
        "service": "BudgetGuard AI",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)