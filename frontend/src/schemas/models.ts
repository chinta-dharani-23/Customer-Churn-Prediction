import { z } from 'zod'

const cell = z.tuple([z.number(), z.number()])
const modelMetrics = z.object({
  accuracy: z.number(), precision: z.number(), recall: z.number(), f1: z.number(),
  roc_auc: z.number().nullable(),
  /** [[TN, FP], [FN, TP]] */
  confusion_matrix: z.tuple([cell, cell]),
  best_params: z.record(z.string(), z.unknown()).optional(),
  cv_f1_mean: z.number().optional(),
  cv_f1_std: z.number().optional(),
})

/** Matches the backend's GET /models (the contents of ml/models/metrics.json). */
export const modelsResponseSchema = z.object({
  best_model: z.string(),
  models: z.record(z.string(), modelMetrics),
})
export type ModelsResponse = z.infer<typeof modelsResponseSchema>
export type ModelMetrics = z.infer<typeof modelMetrics>
