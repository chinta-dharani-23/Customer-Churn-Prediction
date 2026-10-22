import { predictionResultSchema, type PredictionInput } from '@/schemas/prediction'
import { apiClient } from './apiClient'
import { request } from './dataSource'
import { endpoints } from './endpoints'

/** Form values -> the field names the backend's CustomerFeatures schema uses. */
const toBackend = (i: PredictionInput) => ({
  gender: i.gender, SeniorCitizen: i.seniorCitizen, Partner: i.partner, Dependents: i.dependents, tenure: i.tenureMonths,
  PhoneService: i.phoneService, MultipleLines: i.multipleLines, InternetService: i.internetService,
  OnlineSecurity: i.onlineSecurity, OnlineBackup: i.onlineBackup, DeviceProtection: i.deviceProtection,
  TechSupport: i.techSupport, StreamingTV: i.streamingTv, StreamingMovies: i.streamingMovies,
  Contract: i.contract, PaperlessBilling: i.paperlessBilling, PaymentMethod: i.paymentMethod,
  MonthlyCharges: i.monthlyCharges, TotalCharges: i.totalCharges,
})

/** The inverse, used when a saved prediction is fetched from the backend. */
const fromBackendInput = (f: Record<string, unknown>) => ({
  gender: f.gender, seniorCitizen: f.SeniorCitizen, partner: f.Partner, dependents: f.Dependents, tenureMonths: f.tenure,
  phoneService: f.PhoneService, multipleLines: f.MultipleLines, internetService: f.InternetService,
  onlineSecurity: f.OnlineSecurity, onlineBackup: f.OnlineBackup, deviceProtection: f.DeviceProtection,
  techSupport: f.TechSupport, streamingTv: f.StreamingTV, streamingMovies: f.StreamingMovies,
  contract: f.Contract, paperlessBilling: f.PaperlessBilling, paymentMethod: f.PaymentMethod,
  monthlyCharges: f.MonthlyCharges, totalCharges: f.TotalCharges,
}) as PredictionInput

interface BackendPrediction {
  prediction_id: number; created_at?: string | null; churn_prediction: boolean; churn_probability: number
  risk_level: string; model_used: string; input_features?: Record<string, unknown>
  top_factors?: Array<{ feature: string; importance?: number | null; direction?: 'increases' | 'decreases' | null }>
}

// SQLite returns UTC timestamps without a zone marker; treat those as UTC.
const asIso = (s?: string | null) => (s ? (/Z$|[+-]\d\d:\d\d$/.test(s) ? s : `${s}Z`) : new Date().toISOString())

const fromBackend = (d: BackendPrediction, input: PredictionInput) => ({
  predictionId: String(d.prediction_id),
  customerId: input.customerId?.trim() || null,
  predictedClass: d.churn_prediction ? 'Churn' : 'No Churn',
  probability: d.churn_probability,
  riskCategory: d.risk_level,
  model: d.model_used,
  createdAt: asIso(d.created_at),
  topFactors: (d.top_factors ?? []).map((f) => ({ feature: f.feature, importance: f.importance ?? undefined, direction: f.direction ?? undefined })),
  input,
})

const requestPrediction = (input: PredictionInput) =>
  request(
    predictionResultSchema,
    async () => fromBackend((await apiClient.post<BackendPrediction>(endpoints.predictions, toBackend(input))).data, input),
    () => import('@/mocks/prediction').then((m) => m.createMockPrediction(input)),
  )

export const getPrediction = (id: string) =>
  request(
    predictionResultSchema,
    async () => {
      const { data } = await apiClient.get<BackendPrediction>(endpoints.prediction(id))
      return fromBackend(data, fromBackendInput(data.input_features ?? {}))
    },
    () => import('@/mocks/prediction').then((m) => m.getMockPrediction(id)),
  )

/** Also remembers the latest prediction ID so the Explainable AI page can open it. */
export async function createPrediction(input: PredictionInput) {
  const result = await requestPrediction(input)
  try { sessionStorage.setItem('prediction:last', result.predictionId) } catch { /* optional */ }
  return result
}
