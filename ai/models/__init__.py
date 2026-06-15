"""
Centralized model singletons.
Each gunicorn worker loads these ONCE at import time.
All routers share the same instances within a worker process.
"""

from models.anomaly_model import AnomalyDetector
from models.prediction_model import LapsePredictor

# Singleton instances — created once per worker process
detector = AnomalyDetector()
predictor = LapsePredictor()