"""
routers/batch.py
-----------------
POST /predict/batch — upload a CSV of many customers, get back a
ranked list (highest churn risk first). Closer to how a retention
team would actually use this day to day than one-at-a-time entry.

Every row is validated with the same CustomerFeatures schema as POST /predict,
so a typo like "Fibre optic" returns a clear 422 naming the row, instead of
being silently scored as some other category.
"""

import io

import pandas as pd
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.db import get_db
from app.models import Prediction
from app.schemas import CustomerFeatures
from app.ml.model_loader import get_model, get_model_name, encode_dataframe
from app.ml.explainer import get_risk_level

router = APIRouter()

REQUIRED = list(CustomerFeatures.model_fields.keys())
NUMERIC = ["tenure", "MonthlyCharges", "TotalCharges"]


def _parse(contents: bytes) -> tuple[pd.DataFrame, list[str]]:
    """CSV bytes -> (validated feature frame, customer ids). Raises 422 with a readable message."""
    try:
        raw = pd.read_csv(io.BytesIO(contents), dtype=str, keep_default_na=False, encoding="utf-8-sig")
    except Exception:  # noqa: BLE001
        raise HTTPException(422, "Could not read the file as CSV.")

    raw.columns = [str(c).strip() for c in raw.columns]
    raw = raw.apply(lambda col: col.str.strip())

    if raw.empty:
        raise HTTPException(422, "The CSV has no rows.")
    if len(raw) > settings.BATCH_MAX_ROWS:
        raise HTTPException(422, f"Too many rows ({len(raw)}). The limit is {settings.BATCH_MAX_ROWS} per upload.")
    missing = [c for c in REQUIRED if c not in raw.columns]
    if missing:
        raise HTTPException(422, f"Missing column(s): {', '.join(missing)}. Download the CSV template for the expected layout.")

    # A blank TotalCharges means tenure 0 in the Telco data; training treated it as 0 too.
    raw["TotalCharges"] = raw["TotalCharges"].replace("", "0")
    for col in NUMERIC:
        raw[col] = pd.to_numeric(raw[col], errors="coerce")

    ids = (raw["customerID"] if "customerID" in raw.columns else pd.Series([""] * len(raw))).tolist()
    ids = [i if i else f"row_{n + 1}" for n, i in enumerate(ids)]

    problems, clean = [], []
    for n, rec in enumerate(raw[REQUIRED].to_dict(orient="records")):
        for col in NUMERIC:  # NaN (unparseable number) -> None so validation reports it
            if pd.isna(rec[col]):
                rec[col] = None
        if rec["tenure"] is not None and float(rec["tenure"]).is_integer():
            rec["tenure"] = int(rec["tenure"])
        try:
            clean.append(CustomerFeatures(**rec).model_dump())
        except ValidationError as e:
            first = e.errors()[0]
            problems.append(f"row {n + 2}: {'.'.join(map(str, first['loc']))} - {first['msg']}")

    if problems:
        extra = f" (+{len(problems) - 5} more)" if len(problems) > 5 else ""
        raise HTTPException(422, "Invalid data - " + "; ".join(problems[:5]) + extra)

    return pd.DataFrame(clean), ids


def _score(frame: pd.DataFrame):
    return get_model().predict_proba(encode_dataframe(frame))[:, 1]


@router.post("/predict/batch")
async def predict_batch(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    frame, ids = _parse(await file.read())
    probabilities = await run_in_threadpool(_score, frame)

    model_name = get_model_name()
    results, rows = [], []
    for cid, features, prob in zip(ids, frame.to_dict(orient="records"), probabilities):
        prob = float(prob)
        risk = get_risk_level(prob)
        results.append({"customerID": cid, "churn_probability": round(prob, 4), "risk_level": risk})
        rows.append(Prediction(
            input_features={"customerID": cid, **features},
            churn_prediction=prob >= 0.5,
            churn_probability=prob,
            risk_level=risk,
            model_used=model_name,
            top_factors=None,
            source="batch",
        ))

    db.add_all(rows)
    await db.commit()

    # Highest risk first — this is the order a retention team actually wants
    results.sort(key=lambda r: r["churn_probability"], reverse=True)
    return {"count": len(results), "results": results}