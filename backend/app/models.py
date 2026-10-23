"""
models.py
---------
Tables in the database (Neon Postgres or local SQLite):
  - predictions   : every prediction made, for the history dashboard
  - model_metrics : the 4 models' scores (reserved for the comparison page;
                    /models currently serves ml/models/metrics.json directly)
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, Boolean
from sqlalchemy.sql import func

from app.db import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Raw input the customer/agent submitted, kept as JSON so the schema
    # can evolve without a migration every time a field changes
    input_features = Column(JSON, nullable=False)

    churn_prediction = Column(Boolean, nullable=False)
    churn_probability = Column(Float, nullable=False)
    risk_level = Column(String, nullable=False)  # "Low" | "Medium" | "High"
    model_used = Column(String, nullable=False)
    # list of {feature, shap_value, direction, importance, value}  (SHAP)
    # or      {feature, importance, value}                          (feature-importance fallback)
    top_factors = Column(JSON, nullable=True)

    source = Column(String, default="single")  # "single" | "batch"


class ModelMetric(Base):
    __tablename__ = "model_metrics"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String, nullable=False, unique=True)
    accuracy = Column(Float)
    precision = Column(Float)
    recall = Column(Float)
    f1 = Column(Float)
    roc_auc = Column(Float)
    is_best = Column(Boolean, default=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())