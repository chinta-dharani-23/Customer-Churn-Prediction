/**
 * DEMO DATA: a copy of ml/models/metrics.json from the team's training run, used only in demo mode.
 * With VITE_USE_MOCKS=false the page shows whatever the backend returns instead.
 */
const m = (accuracy: number, precision: number, recall: number, f1: number, roc_auc: number, cm: [[number, number], [number, number]], cv: number, sd: number, params: Record<string, unknown>) =>
  ({ accuracy, precision, recall, f1, roc_auc, confusion_matrix: cm, cv_f1_mean: cv, cv_f1_std: sd, best_params: params })

export const modelsMock = {
  best_model: 'XGBoost',
  models: {
    RandomForest: m(0.7722, 0.5609, 0.6524, 0.6032, 0.8336, [[844, 191], [130, 244]], 0.8513, 0.0358, { max_depth: null, n_estimators: 100 }),
    AdaBoost: m(0.7395, 0.5061, 0.7727, 0.6116, 0.8468, [[753, 282], [85, 289]], 0.8104, 0.0251, { learning_rate: 0.5, n_estimators: 200 }),
    GradientBoosting: m(0.7686, 0.5524, 0.6765, 0.6082, 0.8346, [[830, 205], [121, 253]], 0.832, 0.0508, { learning_rate: 0.1, max_depth: 5, n_estimators: 200 }),
    XGBoost: m(0.7658, 0.5455, 0.7059, 0.6154, 0.8358, [[815, 220], [110, 264]], 0.8363, 0.043, { learning_rate: 0.1, max_depth: 5, n_estimators: 200 }),
  },
}
