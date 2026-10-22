import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { chartColors, tooltipStyle } from './colors'

interface Series { key: string; label: string; color: string }
interface BarSeriesChartProps {
  data: Array<Record<string, string | number>>
  xKey: string
  series: Series[]
  stacked?: boolean
  height?: number
}

/** Grouped or stacked vertical bars: contract mix, tenure buckets, charge ranges. */
export function BarSeriesChart({ data, xKey, series, stacked, height = 260 }: BarSeriesChartProps) {
  const tick = { fill: chartColors.text, fontSize: 12 }
  return (
    <div style={{ height }} role="img" aria-label={`Bar chart of ${series.map((s) => s.label).join(' and ')} by ${xKey}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -12 }}>
          <CartesianGrid stroke={chartColors.grid} vertical={false} />
          <XAxis dataKey={xKey} tick={tick} tickLine={false} axisLine={{ stroke: chartColors.grid }} />
          <YAxis tick={tick} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--bg)' }} />
          {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
          {series.map((s) => (
            <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} stackId={stacked ? 'a' : undefined} radius={stacked ? 0 : [4, 4, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
