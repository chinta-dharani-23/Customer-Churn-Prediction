import { useState } from 'react'
import { Download, Printer } from 'lucide-react'
import { ChartCard, chartColors, DonutChart } from '@/components/charts'
import { DemoNotice } from '@/components/feedback'
import { Badge, Button, Card, CardBody, CardHeader, ErrorState, PageHeader, Skeleton, Table, TBody, Td, Th, THead, Tr } from '@/components/ui'
import { downloadCsv, toCsv } from '@/features/predictions/batchCsv'
import { useQuery } from '@/hooks'
import { getDashboard, getModels } from '@/services'
import { formatNumber, formatPercent } from '@/utils'

const cols = [['accuracy', 'Accuracy'], ['precision', 'Precision'], ['recall', 'Recall'], ['f1', 'F1-score'], ['roc_auc', 'ROC-AUC']] as const
const colors = { High: chartColors.churn, Medium: '#f59e0b', Low: chartColors.retained } as const

export default function AnalyticsPage() {
  const [generated] = useState(() => new Date().toLocaleString())
  const dash = useQuery(getDashboard)
  const models = useQuery(getModels)
  const names = models.data ? Object.keys(models.data.models) : []
  const exportModels = () => models.data && downloadCsv('model-comparison.csv', toCsv([['model', ...cols.map(([, l]) => l)], ...names.map((n) => [n, ...cols.map(([k]) => models.data!.models[n][k] ?? '')])]))

  return (
    <>
      <PageHeader
        title="Analytics and reports"
        description="A printable summary of prediction activity and model comparison."
        actions={<div data-print-hide className="flex gap-2">
          <Button variant="secondary" onClick={exportModels} disabled={!models.data}><Download className="h-4 w-4" aria-hidden />Models CSV</Button>
          <Button variant="secondary" onClick={() => window.print()}><Printer className="h-4 w-4" aria-hidden />Print report</Button>
        </div>}
      />
      <DemoNotice>Demo mode: this report uses sample data and must not be submitted as project results.</DemoNotice>
      <p className="mb-4 text-sm text-muted">Report generated {generated}</p>
      <div className="space-y-6">
        <ChartCard title="Prediction activity" description="Saved predictions by risk level" loading={dash.loading} error={dash.error} onRetry={dash.refetch} empty={dash.data?.total_predictions === 0}>
          {dash.data && (
            <div className="grid gap-6 lg:grid-cols-2">
              <DonutChart centerLabel="predictions" data={(['High', 'Medium', 'Low'] as const).map((k) => ({ name: `${k} risk`, value: dash.data!.risk_distribution[k] ?? 0, color: colors[k] }))} />
              <dl className="space-y-3 self-center text-sm">
                <div className="flex justify-between"><dt className="text-muted">Total predictions</dt><dd className="font-medium text-ink">{formatNumber(dash.data.total_predictions)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted">Predicted churn rate</dt><dd className="font-medium text-ink">{formatPercent(dash.data.churn_rate)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted">Days with activity</dt><dd className="font-medium text-ink">{dash.data.predictions_over_time.length}</dd></div>
              </dl>
            </div>
          )}
        </ChartCard>

        <Card>
          <CardHeader title="Model comparison" description="Test-set metrics from the training pipeline" />
          {models.loading && <CardBody><Skeleton className="h-32" /></CardBody>}
          {models.error && <ErrorState message={models.error.message} onRetry={models.refetch} />}
          {models.data && <CardBody><Table>
            <THead><Tr><Th>Model</Th>{cols.map(([, l]) => <Th key={l}>{l}</Th>)}</Tr></THead>
            <TBody>{names.map((n) => (
              <Tr key={n}><Td className="font-medium">{n}{n === models.data!.best_model && <Badge variant="success" className="ml-2">Best by F1</Badge>}</Td>
                {cols.map(([k]) => <Td key={k}>{models.data!.models[n][k]?.toFixed(3) ?? 'n/a'}</Td>)}</Tr>
            ))}</TBody>
          </Table></CardBody>}
        </Card>
        <p className="text-xs text-muted">Predictions are model estimates, not guarantees. Metrics reflect a held-out test set; the dataset is imbalanced, so F1, precision and recall are more informative than accuracy.</p>
      </div>
    </>
  )
}
