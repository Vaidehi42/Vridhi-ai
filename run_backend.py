"""
Wrapper launcher for Vridhi AI backend server on Windows / Python 3.13.
Registers numpy float encoder types with FastAPI so JSON serialization works without modifying backend/app.py.
"""
import sys
import os
from pathlib import Path

# Add the project root to the import path. The uploaded package keeps app.py,
# forecast_api.py and the model artifacts together at the project root.
PROJECT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(PROJECT_DIR))
os.environ.setdefault("MODEL_PATH", str(PROJECT_DIR / "creditlens_model.joblib"))
os.environ.setdefault("PORTFOLIO_PATH", str(PROJECT_DIR / "portfolio_scored.csv"))

import numpy as np
from fastapi.encoders import ENCODERS_BY_TYPE

# Register numpy data types with FastAPI encoder
ENCODERS_BY_TYPE[np.float32] = float
ENCODERS_BY_TYPE[np.float64] = float
ENCODERS_BY_TYPE[np.int64] = int
ENCODERS_BY_TYPE[np.int32] = int

import app

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    print(f"\nVridhi AI backend wrapper running on http://localhost:{port}\n")
    uvicorn.run(app.app, host="0.0.0.0", port=port)
