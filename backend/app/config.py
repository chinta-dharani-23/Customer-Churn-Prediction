"""
config.py
---------
Loads environment variables once. Every other module imports `settings`
from here instead of calling os.getenv directly, so there's one place
to check when something's misconfigured.
"""

import os
from dotenv import load_dotenv

load_dotenv()

_ML_MODELS = os.path.join(os.path.dirname(__file__), "..", "..", "ml", "models")


class Settings:
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", "postgresql+asyncpg://user:pass@localhost/churn_db"
    )
    CORS_ORIGINS: list[str] = os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")

    # Model + preprocessing artifacts written by ml/src/train_paper.py
    MODEL_PATH: str = os.path.join(_ML_MODELS, "best_model.pkl")
    FEATURE_SPEC_PATH: str = os.path.join(_ML_MODELS, "feature_spec.json")
    METRICS_PATH: str = os.path.join(_ML_MODELS, "metrics.json")
    STATS_PATH: str = os.path.join(_ML_MODELS, "statistical_test.json")
    SHAP_BACKGROUND_PATH: str = os.path.join(_ML_MODELS, "shap_background.csv")

    # SHAP figures written by ml/src/explain_paper.py
    REPORTS_DIR: str = os.path.join(
        os.path.dirname(__file__), "..", "..", "ml", "reports"
    )


settings = Settings()