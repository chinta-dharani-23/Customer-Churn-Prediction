"""
routers/dashboard.py
---------------------
GET /dashboard — aggregate stats over everything logged in the database so far.
This is what makes the database actually earn its place instead of
sitting unused.
"""

from collections import Counter

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models import Prediction
from app.schemas import DashboardStats

router = APIRouter()


@router.get("/dashboard", response_model=DashboardStats)
async def dashboard(db: AsyncSession = Depends(get_db)):
    # Only the three columns needed — not the (large) JSON input of every row.
    rows = (await db.execute(
        select(Prediction.churn_prediction, Prediction.risk_level, Prediction.created_at)
    )).all()

    total = len(rows)
    churned = sum(1 for r in rows if r.churn_prediction)
    churn_rate = round(churned / total, 4) if total else 0.0

    risk_counts = Counter(r.risk_level for r in rows)
    by_day = Counter(r.created_at.date().isoformat() for r in rows if r.created_at)
    trend = [{"date": day, "count": count} for day, count in sorted(by_day.items())]

    return DashboardStats(
        total_predictions=total,
        churn_rate=churn_rate,
        risk_distribution=dict(risk_counts),
        predictions_over_time=trend,
    )