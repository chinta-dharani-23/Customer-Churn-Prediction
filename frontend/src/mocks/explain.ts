/** DEMO DATA: invented values for development only. NOT real SHAP output. */
export const globalExplanationMock = {
  method: 'shap (demo)',
  sample_size: 300,
  features: [
    ['Contract', 0.82], ['tenure', 0.61], ['MonthlyCharges', 0.44], ['InternetService', 0.37], ['TotalCharges', 0.31],
    ['PaymentMethod', 0.22], ['TechSupport', 0.18], ['OnlineSecurity', 0.15], ['PaperlessBilling', 0.09], ['SeniorCitizen', 0.06],
  ].map(([feature, mean_abs_shap]) => ({ feature, mean_abs_shap })),
}
