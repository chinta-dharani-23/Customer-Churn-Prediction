import { narrativeSchema } from '@/schemas/narrative'
import { apiClient } from './apiClient'
import { request } from './dataSource'
import { endpoints } from './endpoints'

/** Asks the backend (which holds the AI key) to explain a saved prediction in plain language. */
export const explainInWords = (predictionId: string, question?: string) =>
  request(
    narrativeSchema,
    async () => (await apiClient.post(endpoints.explainNarrative, { prediction_id: Number(predictionId), question: question || undefined }, { timeout: 60_000 })).data,
    () => import('@/mocks/narrative').then((m) => m.narrativeMock),
  )
