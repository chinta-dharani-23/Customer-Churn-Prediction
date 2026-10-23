"""
routers/explain.py
-------------------
GET /explainability/global — mean |SHAP| per feature over a sample of customers.
Computed once on first request, then cached in memory.
"""

from fastapi import APIRouter, HTTPException
from fastapi.concurrency import run_in_threadpool

from app.ml.explainer import global_ranking

router = APIRouter()


@router.get("/explainability/global")
async def explain_global(top_n: int = 15):
    try:
        data = await run_in_threadpool(global_ranking)
    except FileNotFoundError as e:
        raise HTTPException(404, str(e))
    except Exception as e:  # noqa: BLE001  (e.g. shap not installed)
        raise HTTPException(503, f"Global SHAP explanation is unavailable: {e}")
    return {**data, "features": data["features"][: max(1, top_n)]}