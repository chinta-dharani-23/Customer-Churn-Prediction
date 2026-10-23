"""
routers/narrative.py
---------------------
POST /explainability/narrative — plain-language explanation of a SAVED prediction.

Security design:
  * The browser sends only {prediction_id, question}. The backend loads the saved
    SHAP results itself, so the client cannot inject its own "facts" into the prompt.
  * The API key is LLM_API_KEY in backend/.env; the frontend never holds a key.
  * 503 no key set | 404 unknown prediction | 429 over 10 req/min per IP | 502 AI service failed.

Provider: Google Gemini REST API (generateContent). Model name is LLM_MODEL.
"""

import time
from collections import defaultdict, deque

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.db import get_db
from app.models import Prediction
from app.schemas import NarrativeRequest, NarrativeResponse

router = APIRouter()

DISCLAIMER = (
    "AI-generated summary of the model's SHAP results. It describes what the model weighed, "
    "not why the customer actually behaves this way. Verify before acting."
)

SYSTEM_PROMPT = (
    "You explain a telecom customer-churn model's output to a non-technical retention manager. "
    "Use ONLY the facts provided. Do not invent numbers, causes, or customer details. "
    "A factor that 'increases' churn risk pushed the model's score toward churn; 'decreases' pushed it away. "
    "These are correlations learned by the model, not proven causes. Keep answers under 150 words, in plain English, "
    "no markdown headings. If the question is unrelated to this prediction, politely say you can only explain this prediction."
)

_hits: dict[str, deque] = defaultdict(deque)


def _check_rate_limit(ip: str):
    now = time.monotonic()
    q = _hits[ip]
    while q and now - q[0] > 60:
        q.popleft()
    if len(q) >= settings.NARRATIVE_RATE_LIMIT:
        raise HTTPException(429, "Too many requests. Please wait a minute and try again.")
    q.append(now)


def _facts(row: Prediction) -> str:
    lines = [
        f"Predicted outcome: {'will churn' if row.churn_prediction else 'will stay'}",
        f"Churn probability: {row.churn_probability:.0%}",
        f"Risk level: {row.risk_level}",
        "Top factors (largest effect first):",
    ]
    for f in row.top_factors or []:
        direction = f.get("direction") or "(no direction available)"
        lines.append(f"- {f['feature']} = {f.get('value')} -> {direction} churn risk (strength {f.get('importance')})")
    return "\n".join(lines)


@router.post("/explainability/narrative", response_model=NarrativeResponse)
async def narrative(body: NarrativeRequest, request: Request, db: AsyncSession = Depends(get_db)):
    if not settings.LLM_API_KEY:
        raise HTTPException(503, "AI explanations are not configured. Set LLM_API_KEY in backend/.env.")
    _check_rate_limit(request.client.host if request.client else "unknown")

    row = await db.get(Prediction, body.prediction_id)
    if row is None:
        raise HTTPException(404, f"Prediction {body.prediction_id} not found.")
    if not row.top_factors:
        raise HTTPException(422, "This prediction has no saved explanation (batch rows are not explained individually).")

    question = (body.question or "").strip() or "Explain in plain language why the model gave this score."
    payload = {
        "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": [{"role": "user", "parts": [{"text": f"{_facts(row)}\n\nQuestion: {question}"}]}],
        "generationConfig": {"temperature": 0.3, "maxOutputTokens": 1024},
    }
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.LLM_MODEL}:generateContent"

    try:
        async with httpx.AsyncClient(timeout=45) as client:
            r = await client.post(url, json=payload, headers={"x-goog-api-key": settings.LLM_API_KEY})
        r.raise_for_status()
        parts = r.json()["candidates"][0]["content"]["parts"]
        text = "".join(p.get("text", "") for p in parts).strip()
    except (httpx.HTTPError, KeyError, IndexError, ValueError):
        raise HTTPException(502, "The AI service could not produce an explanation right now. Please try again.")

    if not text:
        raise HTTPException(502, "The AI service returned an empty answer. Please try again.")
    return NarrativeResponse(text=text, model=settings.LLM_MODEL, disclaimer=DISCLAIMER)