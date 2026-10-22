import { z } from 'zod'

/** Option lists follow the Telco churn dataset. Adjust here if the team dataset differs. */
export const options = {
  gender: ['Male', 'Female'],
  yesNo: ['Yes', 'No'],
  yesNoPhone: ['Yes', 'No', 'No phone service'],
  yesNoInternet: ['Yes', 'No', 'No internet service'],
  internet: ['DSL', 'Fiber optic', 'No'],
  contract: ['Month-to-month', 'One year', 'Two year'],
  payment: ['Electronic check', 'Mailed check', 'Bank transfer (automatic)', 'Credit card (automatic)'],
} as const

const pick = (values: readonly [string, ...string[]]) => z.enum(values, { error: 'Select an option' })
const amount = (label: string) => z.number({ error: `Enter ${label}` }).min(0, `${label} cannot be negative`)

export const predictionInputSchema = z.object({
  customerId: z.string().trim().max(40, 'Use 40 characters or fewer').optional(),
  gender: pick(options.gender),
  seniorCitizen: pick(options.yesNo),
  partner: pick(options.yesNo),
  dependents: pick(options.yesNo),
  tenureMonths: z.number({ error: 'Enter tenure in months' }).int('Use a whole number').min(0, 'Tenure cannot be negative').max(120, 'Tenure must be 120 months or less'),
  phoneService: pick(options.yesNo),
  multipleLines: pick(options.yesNoPhone),
  internetService: pick(options.internet),
  onlineSecurity: pick(options.yesNoInternet),
  onlineBackup: pick(options.yesNoInternet),
  deviceProtection: pick(options.yesNoInternet),
  techSupport: pick(options.yesNoInternet),
  streamingTv: pick(options.yesNoInternet),
  streamingMovies: pick(options.yesNoInternet),
  contract: pick(options.contract),
  paperlessBilling: pick(options.yesNo),
  paymentMethod: pick(options.payment),
  monthlyCharges: amount('monthly charges'),
  totalCharges: amount('total charges'),
})

export const predictionResultSchema = z.object({
  predictionId: z.string(),
  customerId: z.string().nullable(),
  predictedClass: z.enum(['Churn', 'No Churn']),
  /** Fraction 0 to 1; null if the model does not supply one. */
  probability: z.number().min(0).max(1).nullable(),
  /** Only shown when the backend or an agreed project threshold defines it. */
  riskCategory: z.string().nullable().optional(),
  model: z.string(),
  createdAt: z.string(),
  topFactors: z.array(z.object({ feature: z.string(), direction: z.enum(['increases', 'decreases']).optional(), importance: z.number().optional() })).optional(),
  input: predictionInputSchema,
})

export type PredictionInput = z.infer<typeof predictionInputSchema>
export type PredictionResult = z.infer<typeof predictionResultSchema>
