# API Contract (proposed)

These are **proposed** contracts for the backend team, not existing endpoints. Paths are relative to
`VITE_API_BASE_URL` and can be changed in one file: `src/services/endpoints.ts`.
Every response is validated in the frontend with Zod (`src/schemas/`). A mismatch shows
"The server response did not match the expected format" instead of broken charts.

## Modes
- `VITE_USE_MOCKS=true`: labeled demo data from `src/mocks/`, DEMO MODE badge visible.
- `VITE_USE_MOCKS=false`: real API only. A failed request shows an error; the app never substitutes fake data.

## Errors
Any non-2xx response should return JSON. The frontend shows `message` (or `detail`):
```json
{ "message": "Human-readable explanation", "code": "OPTIONAL_CODE" }
```

## Endpoints
| Method | Path | Purpose | Contract status |
|---|---|---|---|
| GET | `/health` | Backend and model availability | Defined below |
| GET | `/dashboard/summary` | Dashboard metrics and chart data | Defined below |
| POST | `/datasets/upload` | Upload CSV (multipart, field `file`) | Added with dataset module |
| GET | `/datasets` | Dataset history | Added with dataset module |
| GET | `/datasets/{datasetId}/preview` | Preview rows, column types, missing/duplicate summary | Added with dataset module |
| GET | `/customers` | Paginated list (`page`, `pageSize`, `search`, `churn`, `risk`, `contract`, `tenureMin`, `tenureMax`, `chargesMin`, `chargesMax`, `sortBy`, `sortDir`) | Added with customer module |
| GET | `/customers/{customerId}` | Customer profile | Added with customer module |
| POST | `/predictions` | Predict churn for one customer | Added with prediction module |
| GET | `/predictions/{predictionId}` | Stored prediction result | Added with prediction module |
| GET | `/models/performance` | Metrics for all four models | Added with model module |
| GET | `/models/{modelName}/metrics` | One model's metrics and confusion matrix | Added with model module |
| GET | `/explainability/global` | Global feature importance / SHAP summary | Added with explainability module |
| GET | `/explainability/local/{predictionId}` | Per-prediction feature contributions | Added with explainability module |
| GET | `/analytics/churn` | Churn breakdowns for reports | Added with analytics module |
| GET | `/retention/high-risk` | High-risk customers with recommendations | Added with retention module |

Each "Added with..." row gets its full request/response schema in this file when that module is built.

## GET /health
```json
{ "status": "ok", "version": "1.0.0", "modelLoaded": true }
```

## GET /dashboard/summary
```json
{
  "totalCustomers": 1200, "predictedChurn": 312, "predictedRetained": 888,
  "churnRate": 0.26, "highRiskCount": 96,
  "model": { "name": "XGBoost", "status": "ready", "updatedAt": "2026-09-15T10:30:00Z" },
  "contractDistribution": [{ "contract": "Month-to-month", "churned": 246, "retained": 414 }],
  "tenureChurn": [{ "bucket": "0–12 mo", "churned": 168, "retained": 132 }],
  "monthlyChargesDistribution": [{ "range": "Under 30", "customers": 210 }],
  "recentPredictions": [{
    "predictionId": "p-1005", "customerId": "C-0412", "predictedClass": "Churn",
    "probability": 0.81, "model": "XGBoost", "createdAt": "2026-09-29T14:12:00Z"
  }],
  "highRiskCustomers": [{
    "customerId": "C-0412", "riskScore": 0.81, "contract": "Month-to-month",
    "tenureMonths": 3, "monthlyCharges": 94.5
  }]
}
```
Notes: `churnRate`, `probability`, and `riskScore` are fractions from 0 to 1. `probability` may be `null` if the model does not supply one. `model.status` is `ready`, `training`, or `unavailable`. `predictedClass` is `Churn` or `No Churn`. "High risk" is defined by the backend or an agreed project threshold, never by the frontend.

## POST /predictions
Request body (all fields required except `customerId`; values match the Telco dataset labels):
```json
{
  "customerId": "C-0412", "gender": "Female", "seniorCitizen": "No", "partner": "Yes", "dependents": "No",
  "tenureMonths": 3, "phoneService": "Yes", "multipleLines": "No", "internetService": "Fiber optic",
  "onlineSecurity": "No", "onlineBackup": "No", "deviceProtection": "No", "techSupport": "No",
  "streamingTv": "Yes", "streamingMovies": "Yes", "contract": "Month-to-month", "paperlessBilling": "Yes",
  "paymentMethod": "Electronic check", "monthlyCharges": 94.5, "totalCharges": 283.5
}
```
Response (also returned by `GET /predictions/{predictionId}`):
```json
{
  "predictionId": "p-1005", "customerId": "C-0412", "predictedClass": "Churn", "probability": 0.81,
  "riskCategory": "High", "model": "XGBoost", "createdAt": "2026-09-29T14:12:00Z",
  "topFactors": [{ "feature": "Contract", "direction": "increases" }],
  "input": { "...": "echo of the request body" }
}
```
`probability`, `riskCategory`, and `topFactors` are optional or nullable. The frontend shows `riskCategory` only if supplied.
Allowed values for each field are listed in `src/schemas/prediction.ts` (`options`).

---

# Connected backend (the team's FastAPI app)

Set `VITE_API_BASE_URL=http://localhost:8000` (no `/api`) and `VITE_USE_MOCKS=false`.

| Frontend feature | Backend endpoint | Status |
|---|---|---|
| Settings: Check connection | `GET /health` | Connected |
| Model Performance | `GET /models` | Connected (real `metrics.json` shape) |
| Churn Prediction and Result | `POST /predict` | Connected via adapter (`src/services/predictionService.ts`) |
| Dashboard | `GET /dashboard` (stats over saved predictions) | Connected |
| Batch Prediction | `POST /predict/batch` (multipart, field `file`) | Connected |

Adapter notes:
- Form fields are mapped to the backend names (`tenureMonths` to `tenure`, and so on).
- `SeniorCitizen` is sent as `"Yes"`/`"No"` because the trained encoder treats it as text. The backend schema currently declares `int`, so it must be changed to `str`, or the request returns a 422 that the UI shows.
- The backend returns no prediction ID or timestamp. Results are kept in `sessionStorage` for the browser session, and the timestamp is when the response was received.
- `top_factors` carries model importance with no direction, so it is shown as "Model importance", never as SHAP.

## Additional pages (client-side only)
- **Retention Insights** reuses the latest `/predict/batch` result from the browser session. Suggested actions are simple rules on the churn probability; follow-up status is stored in `localStorage`.
- **Analytics & Reports** combines `/dashboard` and `/models` into a printable report with a model-comparison CSV.
- **Explainable AI** shows `top_factors` from the latest `/predict` result. The global SHAP section reads `GET /explainability/global`, returning `{ "method", "sample_size", "features": [{ "feature", "mean_abs_shap" }] }`.
- **Datasets** and **Customers** pages are not included: the backend has no endpoints for them.

## Backend v1.1 changes (POST /predict and friends)
- `POST /predict` now also returns `prediction_id`, `created_at`, `explanation_method` (`shap` or `feature_importance`) and `input_features`; each top factor carries `shap_value`, `direction` (`increases`/`decreases`) and `importance` (|SHAP|).
- `GET /predict/{prediction_id}` returns a saved prediction, so result pages survive a reload.
- `SeniorCitizen` accepts `Yes`/`No` or `0`/`1`. Unknown category values return 422 with the allowed values, instead of being guessed.

## POST /explainability/narrative (AI plain-language explanation)
Request: `{ "prediction_id": 12, "question": "Which factor matters most?" }` (`question` is optional, max 300 characters).
Response: `{ "text": "...", "model": "gemini-3.5-flash", "disclaimer": "..." }`.
The backend loads the saved prediction and sends only its SHAP results to the AI service, so the browser cannot inject data.
The API key is `LLM_API_KEY` in `backend/.env`; the frontend never holds a key. Errors: 503 if no key is set, 404 for an unknown
prediction, 429 after 10 requests per minute per IP, 502 if the AI service fails. Limits and the model name are configurable.
