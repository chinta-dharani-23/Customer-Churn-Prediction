import os
from functools import lru_cache
import numpy as np
import pandas as pd
import shap
from fastapi import APIRouter, HTTPException
from fastapi.concurrency import run_in_threadpool

from app.config import settings
from app.ml.model_loader import get_model

router = APIRouter()


@lru_cache(maxsize=1)
def _global_ranking():
    bg = pd.read_csv(settings.SHAP_BACKGROUND_PATH)
    sv = shap.TreeExplainer(get_model()).shap_values(bg)
    sv = sv[1] if isinstance(sv, list) else sv
    mean_abs = np.abs(np.asarray(sv)).mean(axis=0)
    order = np.argsort(mean_abs)[::-1]
    return [{"feature": bg.columns[i], "mean_abs_shap": round(float(mean_abs[i]), 4)} for i in order]


@router.get("/explain/global")
async def explain_global(top_n: int = 15):
    if not os.path.exists(settings.SHAP_BACKGROUND_PATH):
        raise HTTPException(404, "shap_background.csv not found - run ml/src/train_paper.py first.")
    return {"features": (await run_in_threadpool(_global_ranking))[:top_n]}


@router.get("/explain/figures")
async def explain_figures():
    if not os.path.isdir(settings.REPORTS_DIR):
        return {"figures": []}
    names = sorted(f for f in os.listdir(settings.REPORTS_DIR) if f.endswith(".png"))
    return {"figures": [{"name": n, "url": f"/reports/{n}"} for n in names]}