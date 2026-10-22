import { options, type PredictionInput } from '@/schemas/prediction'

export interface FieldDef {
  name: keyof PredictionInput
  label: string
  kind: 'text' | 'number' | 'select'
  options?: readonly string[]
  hint?: string
  step?: string
}
export interface SectionDef { title: string; description: string; fields: FieldDef[] }

const sel = (name: keyof PredictionInput, label: string, opts: readonly string[]): FieldDef => ({ name, label, kind: 'select', options: opts })

export const sections: SectionDef[] = [
  { title: 'Customer information', description: 'Who the customer is.', fields: [
    { name: 'customerId', label: 'Customer ID (optional)', kind: 'text', hint: 'Leave blank when predicting for a new customer.' },
    sel('gender', 'Gender', options.gender), sel('seniorCitizen', 'Senior citizen', options.yesNo),
    sel('partner', 'Partner', options.yesNo), sel('dependents', 'Dependents', options.yesNo),
  ] },
  { title: 'Account and tenure', description: 'How long and under which plan.', fields: [
    { name: 'tenureMonths', label: 'Tenure (months)', kind: 'number', step: '1' },
    sel('contract', 'Contract', options.contract),
  ] },
  { title: 'Service subscriptions', description: 'Phone, internet, and add-on services.', fields: [
    sel('phoneService', 'Phone service', options.yesNo), sel('multipleLines', 'Multiple lines', options.yesNoPhone),
    sel('internetService', 'Internet service', options.internet), sel('onlineSecurity', 'Online security', options.yesNoInternet),
    sel('onlineBackup', 'Online backup', options.yesNoInternet), sel('deviceProtection', 'Device protection', options.yesNoInternet),
    sel('techSupport', 'Tech support', options.yesNoInternet), sel('streamingTv', 'Streaming TV', options.yesNoInternet),
    sel('streamingMovies', 'Streaming movies', options.yesNoInternet),
  ] },
  { title: 'Billing and payment', description: 'How the customer is billed.', fields: [
    sel('paperlessBilling', 'Paperless billing', options.yesNo), sel('paymentMethod', 'Payment method', options.payment),
    { name: 'monthlyCharges', label: 'Monthly charges ($)', kind: 'number', step: '0.01' },
    { name: 'totalCharges', label: 'Total charges ($)', kind: 'number', step: '0.01' },
  ] },
]

export const fieldLabels = Object.fromEntries(sections.flatMap((s) => s.fields).map((f) => [f.name, f.label])) as Record<keyof PredictionInput, string>
