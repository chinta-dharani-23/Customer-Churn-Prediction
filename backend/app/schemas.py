from datetime import datetime
from typing import Any, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

YN = Literal["Yes", "No"]
YNI = Literal["Yes", "No", "No internet service"]

_SENIOR_MAP = {
    "0": "No", "0.0": "No", "no": "No", "false": "No", "n": "No",
    "1": "Yes", "1.0": "Yes", "yes": "Yes", "true": "Yes", "y": "Yes",
}


class CustomerFeatures(BaseModel):
    """One customer, using the exact column names the model was trained on."""

    model_config = ConfigDict(extra="ignore")

    gender: Literal["Male", "Female"]
    SeniorCitizen: YN          # accepts "Yes"/"No" or 0/1 (see validator)
    Partner: YN
    Dependents: YN
    tenure: int = Field(ge=0, le=120)
    PhoneService: YN
    MultipleLines: Literal["Yes", "No", "No phone service"]
    InternetService: Literal["DSL", "Fiber optic", "No"]
    OnlineSecurity: YNI
    OnlineBackup: YNI
    DeviceProtection: YNI
    TechSupport: YNI
    StreamingTV: YNI
    StreamingMovies: YNI
    Contract: Literal["Month-to-month", "One year", "Two year"]
    PaperlessBilling: YN
    PaymentMethod: Literal["Electronic check", "Mailed check",
                           "Bank transfer (automatic)", "Credit card (automatic)"]
    MonthlyCharges: float = Field(ge=0)
    TotalCharges: float = Field(ge=0)

    @field_validator("SeniorCitizen", mode="before")
    @classmethod
    def _normalise_senior(cls, v: Any):
        # Frontend sends "Yes"/"No"; the classic Kaggle CSV uses 0/1.
        # Unknown values are returned untouched so validation reports the allowed ones.
        return _SENIOR_MAP.get(str(v).strip().lower(), v)


class TopFactor(BaseModel):
    feature: str
    importance: float                  # |SHAP| (or model importance in fallback mode)
    shap_value: Optional[float] = None  # signed; > 0 pushes toward churn
    direction: Optional[Literal["increases", "decreases"]] = None
    value: Optional[Any] = None        # the customer's actual value for this feature


class PredictionResponse(BaseModel):
    prediction_id: int
    created_at: Optional[datetime] = None
    churn_prediction: bool
    churn_probability: float
    risk_level: str
    model_used: str
    explanation_method: Literal["shap", "feature_importance"]
    top_factors: list[TopFactor]
    input_features: dict


class ModelMetricOut(BaseModel):
    model_name: str
    accuracy: Optional[float]
    precision: Optional[float]
    recall: Optional[float]
    f1: Optional[float]
    roc_auc: Optional[float]
    is_best: bool


class DashboardStats(BaseModel):
    total_predictions: int
    churn_rate: float
    risk_distribution: dict
    predictions_over_time: list[dict]


class NarrativeRequest(BaseModel):
    prediction_id: int
    question: Optional[str] = Field(default=None, max_length=300)


class NarrativeResponse(BaseModel):
    text: str
    model: str
    disclaimer: str