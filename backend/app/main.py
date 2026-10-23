"""
main.py
-------
App entrypoint. Mounts all routers, sets up CORS so the React frontend
can call this API, and loads the ML model once at startup.

Run (from the backend/ folder):
    uvicorn app.main:app --reload --port 8000
Interactive docs: http://localhost:8000/docs
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db import init_db, describe_database
from app import models  # noqa: F401  (registers the tables on Base.metadata)
from app.ml import model_loader
from app.ml.explainer import warm_up
from app.routers import predict, batch, dashboard, models_compare, explain, narrative

log = logging.getLogger("churn")
logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Loads best_model.pkl, preprocessor.pkl, metrics.json into memory once,
    # instead of reading them from disk on every request.
    model_loader.load_artifacts()
    log.info("Model loaded: %s", model_loader.get_model_name())
    # Creates the `predictions` / `model_metrics` tables if they don't exist yet.
    await init_db()
    log.info("Database ready: %s", describe_database())
    await run_in_threadpool(warm_up)  # SHAP explainer
    if not settings.LLM_API_KEY:
        log.info("LLM_API_KEY not set: /explainability/narrative will return 503 (everything else works).")
    yield


app = FastAPI(title="Churn Prediction API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "version": app.version, "modelLoaded": model_loader.is_loaded()}


app.include_router(predict.router, tags=["predict"])
app.include_router(batch.router, tags=["batch"])
app.include_router(dashboard.router, tags=["dashboard"])
app.include_router(models_compare.router, tags=["models"])
app.include_router(explain.router, tags=["explainability"])
app.include_router(narrative.router, tags=["explainability"])