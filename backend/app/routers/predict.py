"""
routers/predict.py
-------------------
POST /predict          score one customer, save it, return SHAP factors
GET  /predict/{id}     fetch a saved prediction (so result pages survive a reload)
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models import Prediction
from app.schemas import CustomerFeatures, PredictionResponse
from app.ml.model_loader import get_model, get_model_name, encode_customer
from app.ml.explainer import local_factors, get_risk_level

router = APIRouter()


def _score(features: dict):
    model = get_model()
    X = encode_customer(features)
    prob = float(model.predict_proba(X)[0][1])
    method, factors = local_factors(X, features)
    return prob, method, factors


def to_response(row: Prediction) -> PredictionResponse:
    factors = row.top_factors or []
    method = "shap" if any("shap_value" in f for f in factors) else "feature_importance"
    return PredictionResponse(
        prediction_id=row.id,
        created_at=row.created_at,
        churn_prediction=row.churn_prediction,
        churn_probability=round(row.churn_probability, 4),
        risk_level=row.risk_level,
        model_used=row.model_used,
        explanation_method=method,
        top_factors=factors,
        input_features=row.input_features or {},
    )


@router.post("/predict", response_model=PredictionResponse)
async def predict(customer: CustomerFeatures, db: AsyncSession = Depends(get_db)):
    features = customer.model_dump()
    probability, _method, factors = await run_in_threadpool(_score, features)

    row = Prediction(
        input_features=features,
        churn_prediction=probability >= 0.5,
        churn_probability=probability,
        risk_level=get_risk_level(probability),
        model_used=get_model_name(),
        top_factors=factors,
        source="single",
    )
    db.add(row)
    await db.commit()
    await db.refresh(row)
    return to_response(row)


@router.get("/predict/{prediction_id}", response_model=PredictionResponse)
async def get_prediction(prediction_id: int, db: AsyncSession = Depends(get_db)):
    row = await db.get(Prediction, prediction_id)
    if row is None:
        raise HTTPException(404, f"Prediction {prediction_id} not found.")
    return to_response(row)