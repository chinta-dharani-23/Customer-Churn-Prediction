import { z } from 'zod'

/** Matches the backend's GET /explainability/global. */
export const globalExplanationSchema = z.object({
  method: z.string(),
  sample_size: z.number().int(),
  features: z.array(z.object({ feature: z.string(), mean_abs_shap: z.number() })),
})
export type GlobalExplanation = z.infer<typeof globalExplanationSchema>
