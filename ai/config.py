import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    PORT = int(os.getenv("PORT", 8000))
    HOST = os.getenv("HOST", "0.0.0.0")
    MODEL_DIR = os.getenv("MODEL_DIR", "trained_models")

config = Config()
