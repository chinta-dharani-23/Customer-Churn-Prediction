// Field definitions mirror backend/app/schemas.py::CustomerFeatures
const YN = ["Yes", "No"];
const YNI = ["Yes", "No", "No internet service"];

export const FIELDS = [
  { name: "gender", label: "Gender", type: "select", options: ["Male", "Female"] },
  { name: "SeniorCitizen", label: "Senior citizen", type: "select", options: [{ v: 0, l: "No" }, { v: 1, l: "Yes" }], numeric: true },
  { name: "Partner", label: "Partner", type: "select", options: YN },
  { name: "Dependents", label: "Dependents", type: "select", options: YN },
  { name: "tenure", label: "Tenure (months)", type: "number", min: 0, max: 100, step: 1, int: true },
  { name: "PhoneService", label: "Phone service", type: "select", options: YN },
  { name: "MultipleLines", label: "Multiple lines", type: "select", options: ["Yes", "No", "No phone service"] },
  { name: "InternetService", label: "Internet service", type: "select", options: ["DSL", "Fiber optic", "No"] },
  { name: "OnlineSecurity", label: "Online security", type: "select", options: YNI },
  { name: "OnlineBackup", label: "Online backup", type: "select", options: YNI },
  { name: "DeviceProtection", label: "Device protection", type: "select", options: YNI },
  { name: "TechSupport", label: "Tech support", type: "select", options: YNI },
  { name: "StreamingTV", label: "Streaming TV", type: "select", options: YNI },
  { name: "StreamingMovies", label: "Streaming movies", type: "select", options: YNI },
  { name: "Contract", label: "Contract", type: "select", options: ["Month-to-month", "One year", "Two year"] },
  { name: "PaperlessBilling", label: "Paperless billing", type: "select", options: YN },
  {
    name: "PaymentMethod", label: "Payment method", type: "select",
    options: ["Electronic check", "Mailed check", "Bank transfer (automatic)", "Credit card (automatic)"],
  },
  { name: "MonthlyCharges", label: "Monthly charges ($)", type: "number", min: 0, step: 0.01 },
  { name: "TotalCharges", label: "Total charges ($)", type: "number", min: 0, step: 0.01 },
];

export const DEFAULTS = {
  gender: "Female", SeniorCitizen: 0, Partner: "No", Dependents: "No", tenure: 5,
  PhoneService: "Yes", MultipleLines: "No", InternetService: "Fiber optic",
  OnlineSecurity: "No", OnlineBackup: "No", DeviceProtection: "No", TechSupport: "No",
  StreamingTV: "No", StreamingMovies: "No", Contract: "Month-to-month",
  PaperlessBilling: "Yes", PaymentMethod: "Electronic check",
  MonthlyCharges: 79.85, TotalCharges: 399.25,
};

export const CSV_COLUMNS = ["customerID", ...FIELDS.map((f) => f.name)];
