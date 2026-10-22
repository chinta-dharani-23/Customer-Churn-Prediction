/** Chart colors. CSS variables keep axes and grids correct in both themes. */
export const chartColors = {
  churn: '#e5484d',
  retained: '#2f6fe4',
  accent: '#8db6ff',
  grid: 'var(--border)',
  text: 'var(--muted)',
} as const

export const tooltipStyle = {
  backgroundColor: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  color: 'var(--text)',
  fontSize: 12,
}
