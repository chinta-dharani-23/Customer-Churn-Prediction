"""
model_loader.py (backend/app/ml/)
----------------------------------
Loads the trained model + fitted preprocessor ONCE, and turns raw customer
rows into exactly the numeric matrix the model was trained on.

The engineered features (engagement_score, service_utilization) are recomputed
here to match ml/src/preprocess.py -> add_engineered_features(). If you change
that function, change _add_engineered_features() below too, or predictions will
be silently wrong even though nothing crashes.
"""

import json

import joblib
import pandas as pd

from app.config import settings

_model = None
_preprocessor = None
_metrics = None

SERVICE_COLS = [
    "PhoneService", "MultipleLines", "InternetService", "OnlineSecurity",
    "OnlineBackup", "DeviceProtection", "TechSupport", "StreamingTV", "StreamingMovies",
]
_NO_SERVICE = ("no", "no phone service", "no internet service")

# Same constants as ml/src/preprocess.py (taken from the training data).
TENURE_MIN, TENURE_MAX = 0, 72
TOTAL_CHARGES_MIN, TOTAL_CHARGES_MAX = 0, 8684.8


def load_artifacts():
    global _model, _preprocessor, _metrics
    _model = joblib.load(settings.MODEL_PATH)
    _preprocessor = joblib.load(settings.PREPROCESSOR_PATH)
    with open(settings.METRICS_PATH) as f:
        _metrics = json.load(f)
    return _model, _preprocessor, _metrics


def is_loaded() -> bool:
    return _model is not None and _preprocessor is not None


def get_model():
    if _model is None:
        load_artifacts()
    return _model


def get_preprocessor():
    if _preprocessor is None:
        load_artifacts()
    return _preprocessor


def get_metrics():
    if _metrics is None:
        load_artifacts()
    return _metrics


def get_model_name() -> str:
    """Friendly name ("XGBoost") taken from metrics.json instead of the sklearn class name ("XGBClassifier")."""
    return str(get_metrics().get("best_model") or type(get_model()).__name__)


def _add_engineered_features(df: pd.DataFrame) -> pd.DataFrame:
    tenure_n = (df["tenure"] - TENURE_MIN) / (TENURE_MAX - TENURE_MIN + 1e-9)
    charges_n = (df["TotalCharges"] - TOTAL_CHARGES_MIN) / (TOTAL_CHARGES_MAX - TOTAL_CHARGES_MIN + 1e-9)
    df["engagement_score"] = (tenure_n + charges_n) / 2
    df["service_utilization"] = df[SERVICE_COLS].apply(
        lambda row: sum(1 for v in row if str(v).strip().lower() not in _NO_SERVICE),
        axis=1,
    )
    return df


def encode_dataframe(raw: pd.DataFrame) -> pd.DataFrame:
    """
    raw: one row per customer, columns named like the CustomerFeatures schema
         (SeniorCitizen already "Yes"/"No"). Returns the encoded, scaled,
         correctly ordered matrix for model.predict_proba().
    """
    pre = get_preprocessor()
    df = raw.copy()
    df["tenure"] = pd.to_numeric(df["tenure"])
    df["MonthlyCharges"] = pd.to_numeric(df["MonthlyCharges"])
    df["TotalCharges"] = pd.to_numeric(df["TotalCharges"])
    df = _add_engineered_features(df)

    for col in pre["categorical_cols"]:
        le = pre["encoders"][col]
        known = set(le.classes_)
        # Inputs are validated upstream, so the fallback should never trigger.
        df[col] = le.transform(df[col].astype(str).map(lambda v: v if v in known else le.classes_[0]))

    df[pre["numeric_cols"]] = pre["scaler"].transform(df[pre["numeric_cols"]])
    return df[pre["feature_order"]]


def encode_customer(customer: dict) -> pd.DataFrame:
    return encode_dataframe(pd.DataFrame([customer]))