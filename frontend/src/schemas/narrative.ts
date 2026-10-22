import { z } from 'zod'

/** Matches the backend's POST /explainability/narrative. */
export const narrativeSchema = z.object({ text: z.string(), model: z.string(), disclaimer: z.string() })
export type Narrative = z.infer<typeof narrativeSchema>
