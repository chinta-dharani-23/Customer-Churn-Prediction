import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.db import init_db
from app import models  # noqa: F401  (registers tables before init_db)
from app.ml.model_loader import load_artifacts
from app.routers import predict, batch, dashboard, models_compare, explain


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_artifacts()      # fails fast if the model files are missing
    await init_db()       # CREATE TABLE IF NOT EXISTS
    yield


app = FastAPI(title="Churn Prediction API", version="2.0.0", lifespan=lifespan)

app.add_middleware(CORSMiddleware, allow_origins=settings.CORS_ORIGINS,
                   allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

if os.path.isdir(settings.REPORTS_DIR):
    app.mount("/reports", StaticFiles(directory=settings.REPORTS_DIR), name="reports")


@app.get("/health")
async def health():
    from app.ml.model_loader import get_model, get_metrics
    return {"status": "ok", "model": type(get_model()).__name__,
            "best_model": get_metrics().get("best_model")}


app.include_router(predict.router, tags=["predict"])
app.include_router(batch.router, tags=["batch"])
app.include_router(dashboard.router, tags=["dashboard"])
app.include_router(models_compare.router, tags=["models"])
app.include_router(explain.router, tags=["explain"])