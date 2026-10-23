import json
import os

from fastapi import APIRouter

from app.config import settings
from app.ml.model_loader import get_metrics

router = APIRouter()


@router.get("/models")
async def get_model_comparison():
    """metrics.json (best_model + 4 models' scores) plus the Wilcoxon test results."""
    out = dict(get_metrics())
    out["statistics"] = {}
    if os.path.exists(settings.STATS_PATH):
        with open(settings.STATS_PATH) as f:
            out["statistics"] = json.load(f)
    return out