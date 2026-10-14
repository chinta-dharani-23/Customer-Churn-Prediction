from fastapi import APIRouter, Depends
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models import Prediction
from app.schemas import CustomerFeatures, PredictionResponse
from app.ml.model_loader import get_model, encode_customer
from app.ml.explainer import get_top_factors, get_risk_level

router = APIRouter()


def _score(features: dict):
    model = get_model()
    X = encode_customer(features)
    prob = float(model.predict_proba(X)[0][1])
    return model, prob, get_top_factors(model, X)


@router.post("/predict", response_model=PredictionResponse)
async def predict(customer: CustomerFeatures, db: AsyncSession = Depends(get_db)):
    features = customer.model_dump()
    model, probability, top_factors = await run_in_threadpool(_score, features)
    prediction = probability >= 0.5
    risk_level = get_risk_level(probability)

    db.add(Prediction(input_features=features, churn_prediction=prediction,
                      churn_probability=probability, risk_level=risk_level,
                      model_used=type(model).__name__, top_factors=top_factors, source="single"))
    await db.commit()

    return PredictionResponse(churn_prediction=prediction, churn_probability=round(probability, 4),
                              risk_level=risk_level, model_used=type(model).__name__,
                              top_factors=top_factors)