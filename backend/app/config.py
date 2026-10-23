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

_HERE = os.path.dirname(os.path.abspath(__file__))
_ML = os.path.normpath(os.path.join(_HERE, "..", "..", "ml"))
_ML_MODELS = os.path.join(_ML, "models")
_ML_PROCESSED = os.path.join(_ML, "processed")


def _env_int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, default))
    except ValueError:
        return default


class Settings:
    # Neon:   postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require
    # Local:  leave DATABASE_URL unset -> a churn.db SQLite file is used, so the
    #         app runs with zero setup. db.py converts either form to an async URL.
    DATABASE_URL: str = os.getenv("DATABASE_URL", "").strip() or "sqlite+aiosqlite:///./churn.db"

    CORS_ORIGINS: list[str] = [
        o.strip()
        for o in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
        if o.strip()
    ]

    # Artifacts written by ml/src/train.py + ml/src/preprocess.py
    MODEL_PATH: str = os.path.join(_ML_MODELS, "best_model.pkl")
    PREPROCESSOR_PATH: str = os.path.join(_ML_MODELS, "preprocessor.pkl")
    METRICS_PATH: str = os.path.join(_ML_MODELS, "metrics.json")
    STATS_PATH: str = os.path.join(_ML_MODELS, "statistical_test.json")

    # Rows used as the SHAP background / global-importance sample. If
    # shap_background.csv doesn't exist, X_test.csv (real, un-SMOTEd rows) is used.
    SHAP_BACKGROUND_PATH: str = os.path.join(_ML_MODELS, "shap_background.csv")
    SHAP_FALLBACK_PATH: str = os.path.join(_ML_PROCESSED, "X_test.csv")
    SHAP_SAMPLE_SIZE: int = _env_int("SHAP_SAMPLE_SIZE", 300)

    # AI plain-language explanation (POST /explainability/narrative).
    # The key lives ONLY here (backend/.env); the browser never sees it.
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "").strip()
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gemini-3.5-flash").strip()
    NARRATIVE_RATE_LIMIT: int = _env_int("NARRATIVE_RATE_LIMIT", 10)  # requests per minute per IP

    # Upper bound on rows in one batch upload.
    BATCH_MAX_ROWS: int = _env_int("BATCH_MAX_ROWS", 5000)


settings = Settings()