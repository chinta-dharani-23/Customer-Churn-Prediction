/** DEMO DATA: invented sample values for development only. Totals are internally consistent. */
export const healthMock = { status: 'ok' as const, version: 'demo', modelLoaded: true }

export const dashboardMock = {
  total_predictions: 240,
  churn_rate: 0.27,
  risk_distribution: { High: 52, Medium: 88, Low: 100 },
  predictions_over_time: [
    { date: '2026-10-11', count: 28 }, { date: '2026-10-12', count: 35 }, { date: '2026-10-13', count: 41 },
    { date: '2026-10-14', count: 30 }, { date: '2026-10-15', count: 38 }, { date: '2026-10-16', count: 33 },
    { date: '2026-10-17', count: 35 },
  ],
}
