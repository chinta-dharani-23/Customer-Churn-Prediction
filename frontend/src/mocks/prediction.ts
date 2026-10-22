import type { PredictionInput } from '@/schemas/prediction'

/**
 * DEMO DATA: a FIXED sample response. It is NOT calculated from the submitted values
 * and is not a real model output. Results live in memory and vanish on reload.
 */
const store = new Map<string, unknown>()

export function createMockPrediction(input: PredictionInput) {
  const predictionId = `demo-${Date.now()}`
  const result = {
    predictionId,
    customerId: input.customerId?.trim() || null,
    predictedClass: 'Churn' as const,
    probability: 0.72,
    riskCategory: null,
    model: 'XGBoost (demo)',
    createdAt: new Date().toISOString(),
    topFactors: [
      { feature: 'Contract', direction: 'increases' as const },
      { feature: 'Tenure months', direction: 'increases' as const },
      { feature: 'Monthly charges', direction: 'increases' as const },
    ],
    input,
  }
  store.set(predictionId, result)
  return result
}

export function getMockPrediction(id: string) {
  const found = store.get(id)
  if (!found) throw new Error('This demo prediction is no longer available. Demo results are lost when the page reloads.')
  return found
}
