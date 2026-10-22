import { Link } from 'react-router-dom'
import { Activity, AlertOctagon, AlertTriangle, FileUp, Gauge, Percent, ShieldCheck } from 'lucide-react'
import { BarSeriesChart, ChartCard, chartColors, DonutChart } from '@/components/charts'
import { DemoNotice } from '@/components/feedback'
import { buttonStyles, Card, EmptyState, ErrorState, PageHeader, Skeleton } from '@/components/ui'
import { StatCard } from '@/features/dashboard/StatCard'
import { useQuery } from '@/hooks'
import { getDashboard } from '@/services'
import { formatNumber, formatPercent } from '@/utils'

const riskColors = { High: chartColors.churn, Medium: '#f59e0b', Low: chartColors.retained } as const

export default function DashboardPage() {
  const { data: s, loading, error, refetch } = useQuery(getDashboard)
  const chart = { loading, error, onRetry: refetch }
  const count = (k: keyof typeof riskColors) => s?.risk_distribution[k] ?? 0

  return (
    <>
      <PageHeader
        title="Overview"
        description="Activity and risk levels across the predictions made through this application."
        actions={
          <>
            <Link to="/prediction" className={buttonStyles('primary', 'sm')}><Activity className="h-4 w-4" aria-hidden />Predict churn</Link>
            <Link to="/batch" className={buttonStyles('secondary', 'sm')}><FileUp className="h-4 w-4" aria-hidden />Batch prediction</Link>
            <Link to="/models" className={buttonStyles('secondary', 'sm')}><Gauge className="h-4 w-4" aria-hidden />Model performance</Link>
          </>
        }
      />
      <DemoNotice />

      {error && !s ? (
        <Card><ErrorState title="Could not load the dashboard" message={error.message} onRetry={refetch} /></Card>
      ) : s && s.total_predictions === 0 ? (
        <Card><EmptyState title="No predictions yet" description="Run a single prediction or upload a CSV, and the statistics will appear here." action={<Link to="/prediction" className={buttonStyles()}>Predict churn</Link>} /></Card>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5" role={loading ? 'status' : undefined}>
            {loading || !s ? Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-24" />) : (
              <>
                <StatCard label="Total predictions" value={formatNumber(s.total_predictions)} icon={Activity} />
                <StatCard label="Predicted churn rate" value={formatPercent(s.churn_rate)} hint="Share flagged as churn" icon={Percent} />
                <StatCard label="High risk" value={formatNumber(count('High'))} icon={AlertOctagon} />
                <StatCard label="Medium risk" value={formatNumber(count('Medium'))} icon={AlertTriangle} />
                <StatCard label="Low risk" value={formatNumber(count('Low'))} icon={ShieldCheck} />
              </>
            )}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="Risk distribution" description="Risk levels as defined by the backend model" {...chart}>
              {s && <DonutChart centerLabel="predictions" data={(['High', 'Medium', 'Low'] as const).map((k) => ({ name: `${k} risk`, value: count(k), color: riskColors[k] }))} />}
            </ChartCard>
            <ChartCard title="Predictions over time" description="Predictions saved per day" empty={s?.predictions_over_time.length === 0} {...chart}>
              {s && <BarSeriesChart data={s.predictions_over_time} xKey="date" series={[{ key: 'count', label: 'Predictions', color: chartColors.retained }]} />}
            </ChartCard>
          </div>
          <p className="text-sm text-muted">These figures cover predictions saved by the backend, not the whole customer base.</p>
        </div>
      )}
    </>
  )
}
