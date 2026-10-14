from typing import Literal, Optional
from pydantic import BaseModel, Field

YN = Literal["Yes", "No"]
YNI = Literal["Yes", "No", "No internet service"]


class CustomerFeatures(BaseModel):
    gender: Literal["Male", "Female"]
    SeniorCitizen: Literal[0, 1]
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


class TopFactor(BaseModel):
    feature: str
    importance: float     # signed SHAP value; >0 pushes toward churn
    value: float
    direction: str


class PredictionResponse(BaseModel):
    churn_prediction: bool
    churn_probability: float
    risk_level: str
    model_used: str
    top_factors: list[TopFactor]


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