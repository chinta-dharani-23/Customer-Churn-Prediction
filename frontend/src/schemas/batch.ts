import { z } from 'zod'

/** Matches the backend's POST /predict/batch, already sorted highest risk first. */
export const batchResponseSchema = z.object({
  count: z.number().int(),
  results: z.array(z.object({
    customerID: z.coerce.string(),
    churn_probability: z.number().min(0).max(1),
    risk_level: z.string(),
  })),
})
export type BatchResponse = z.infer<typeof batchResponseSchema>
