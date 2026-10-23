"""
explainer.py
------------
Backend-side explanations (kept separate from ml/src/explain.py so the backend
never imports from the ml/ folder).

  * local_factors()   - SHAP values for ONE customer (why this score)
  * global_ranking()  - mean |SHAP| over a sample of customers (what matters overall)
  * get_risk_level()  - Low / Medium / High from the churn probability

If the `shap` package can't be imported or fails, local_factors() falls back to
model feature importances and reports method="feature_importance" so the UI
never labels non-SHAP numbers as SHAP.
"""

import logging
import os
from functools import lru_cache

import numpy as np
import pandas as pd

from app.config import settings
from app.ml.model_loader import get_model, get_preprocessor

log = logging.getLogger("churn.explainer")

# Probability cut-offs for the risk label shown in the UI.
HIGH_RISK = 0.66
MEDIUM_RISK = 0.33


def get_risk_level(probability: float) -> str:
    if probability >= HIGH_RISK:
        return "High"
    if probability >= MEDIUM_RISK:
        return "Medium"
    return "Low"


@lru_cache(maxsize=1)
def _explainer():
    import shap  # imported lazily: slow import, and optional dependency
    return shap.TreeExplainer(get_model())


def warm_up():
    """Build the SHAP explainer at startup so the first request isn't slow. Never raises."""
    try:
        _explainer()
        return True
    except Exception as exc:  # noqa: BLE001
        log.warning("SHAP unavailable, falling back to feature importance: %s", exc)
        return False


def _shap_matrix(X: pd.DataFrame) -> np.ndarray:
    sv = _explainer().shap_values(X)
    if isinstance(sv, list):  # older shap/sklearn models: one array per class
        sv = sv[1]
    sv = np.asarray(sv)
    if sv.ndim == 3:          # (rows, features, classes)
        sv = sv[:, :, 1]
    return sv


def _plain(v):
    """numpy scalar -> JSON-safe python value."""
    if isinstance(v, (np.integer,)):
        return int(v)
    if isinstance(v, (np.floating,)):
        return round(float(v), 4)
    return v


def local_factors(X_row: pd.DataFrame, raw_row: dict, top_n: int = 5):
    """
    Returns (method, factors). `raw_row` is the customer's original (human-readable)
    input so each factor can show e.g. Contract = "Month-to-month".
    """
    names = list(X_row.columns)
    try:
        values = _shap_matrix(X_row)[0]
        order = np.argsort(np.abs(values))[::-1][:top_n]
        factors = [
            {
                "feature": names[i],
                "shap_value": round(float(values[i]), 4),
                "importance": round(abs(float(values[i])), 4),
                "direction": "increases" if values[i] > 0 else "decreases",
                "value": _plain(raw_row.get(names[i], X_row.iloc[0][names[i]])),
            }
            for i in order
        ]
        return "shap", factors
    except Exception as exc:  # noqa: BLE001
        log.warning("SHAP failed (%s); using feature importance", exc)

    model = get_model()
    if not hasattr(model, "feature_importances_"):
        return "feature_importance", []
    imp = np.asarray(model.feature_importances_)
    row = X_row.iloc[0].to_numpy(dtype=float)
    order = np.argsort(imp * np.abs(row))[::-1][:top_n]
    return "feature_importance", [
        {"feature": names[i], "importance": round(float(imp[i]), 4),
         "value": _plain(raw_row.get(names[i], row[i]))}
        for i in order
    ]


def _background() -> pd.DataFrame:
    path = settings.SHAP_BACKGROUND_PATH
    if not os.path.exists(path):
        path = settings.SHAP_FALLBACK_PATH
    if not os.path.exists(path):
        raise FileNotFoundError("No SHAP background data (ml/models/shap_background.csv or ml/processed/X_test.csv).")
    df = pd.read_csv(path)
    order = get_preprocessor()["feature_order"]
    df = df[[c for c in order if c in df.columns]]
    if len(df) > settings.SHAP_SAMPLE_SIZE:
        df = df.sample(settings.SHAP_SAMPLE_SIZE, random_state=42)
    return df


@lru_cache(maxsize=1)
def global_ranking():
    bg = _background()
    mean_abs = np.abs(_shap_matrix(bg)).mean(axis=0)
    order = np.argsort(mean_abs)[::-1]
    return {
        "method": "shap",
        "sample_size": int(len(bg)),
        "features": [{"feature": bg.columns[i], "mean_abs_shap": round(float(mean_abs[i]), 4)} for i in order],
    }