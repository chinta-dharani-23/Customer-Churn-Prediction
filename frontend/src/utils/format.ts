export const formatPercent = (fraction: number) => `${Math.round(fraction * 100)}%`
export const formatNumber = (n: number) => n.toLocaleString()
export const formatCurrency = (n: number) => `$${n.toFixed(2)}`
export const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
