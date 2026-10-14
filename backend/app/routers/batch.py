import io, json
import pandas as pd
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models import Prediction
from app.ml.model_loader import get_model, encode_dataframe, CATEGORICAL, NUMERIC
from app.ml.explainer import get_risk_level

router = APIRouter()
REQUIRED = CATEGORICAL + NUMERIC
MAX_ROWS = 5000


def _score(df: pd.DataFrame):
    model = get_model()
    return model, model.predict_proba(encode_dataframe(df))[:, 1]


@router.post("/predict/batch")
async def predict_batch(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    try:
        df = pd.read_csv(io.BytesIO(await file.read()))
    except Exception:
        raise HTTPException(400, "Could not read the file as CSV.")
    if df.empty:
        raise HTTPException(400, "The CSV has no rows.")
    if len(df) > MAX_ROWS:
        raise HTTPException(400, f"Too many rows ({len(df)}). Maximum is {MAX_ROWS}.")
    missing = [c for c in REQUIRED if c not in df.columns]
    if missing:
        raise HTTPException(400, "Missing column(s): " + ", ".join(missing))

    model, probabilities = await run_in_threadpool(_score, df)

    id_col = "customerID" if "customerID" in df.columns else None
    results, to_log = [], []
    for i, prob in enumerate(probabilities):
        prob = float(prob)
        risk = get_risk_level(prob)
        results.append({"customerID": str(df.iloc[i][id_col]) if id_col else f"row_{i}",
                        "churn_probability": round(prob, 4), "risk_level": risk})
        raw = json.loads(df.iloc[i][REQUIRED].to_json())   # numpy/NaN -> plain JSON
        to_log.append(Prediction(input_features=raw, churn_prediction=prob >= 0.5,
                                 churn_probability=prob, risk_level=risk,
                                 model_used=type(model).__name__, top_factors=None, source="batch"))

    db.add_all(to_log)
    await db.commit()
    results.sort(key=lambda r: r["churn_probability"], reverse=True)
    return {"count": len(results), "results": results}