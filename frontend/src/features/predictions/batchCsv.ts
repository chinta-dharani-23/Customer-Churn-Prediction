/** Column names the backend expects in an uploaded CSV (same as its CustomerFeatures schema, plus an ID). */
export const templateColumns = [
  'customerID', 'gender', 'SeniorCitizen', 'Partner', 'Dependents', 'tenure', 'PhoneService', 'MultipleLines',
  'InternetService', 'OnlineSecurity', 'OnlineBackup', 'DeviceProtection', 'TechSupport', 'StreamingTV',
  'StreamingMovies', 'Contract', 'PaperlessBilling', 'PaymentMethod', 'MonthlyCharges', 'TotalCharges',
]
const exampleRow = ['EXAMPLE-001', 'Female', 'No', 'Yes', 'No', '12', 'Yes', 'No', 'DSL', 'Yes', 'No', 'No', 'No', 'No', 'No', 'One year', 'Yes', 'Mailed check', '55.50', '666.00']

const cell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
export const toCsv = (rows: Array<Array<string | number>>) => rows.map((r) => r.map(cell).join(',')).join('\n')

export function downloadCsv(filename: string, csv: string) {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: filename })
  a.click()
  URL.revokeObjectURL(url)
}
export const templateCsv = () => toCsv([templateColumns, exampleRow])
