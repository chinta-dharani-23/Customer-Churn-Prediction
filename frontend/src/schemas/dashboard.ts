import { z } from 'zod'

export const healthSchema = z.object({
  status: z.literal('ok'),
  version: z.string().optional(),
  modelLoaded: z.boolean().optional(),
})

/** Matches the backend's GET /dashboard: stats over the predictions saved in its database. */
export const dashboardStatsSchema = z.object({
  total_predictions: z.number().int(),
  /** Fraction 0 to 1 of saved predictions flagged as churn. */
  churn_rate: z.number().min(0).max(1),
  /** Keys are "High", "Medium", "Low"; missing keys mean zero. */
  risk_distribution: z.record(z.string(), z.number()),
  predictions_over_time: z.array(z.object({ date: z.string(), count: z.number() })),
})

export type Health = z.infer<typeof healthSchema>
export type DashboardStats = z.infer<typeof dashboardStatsSchema>
