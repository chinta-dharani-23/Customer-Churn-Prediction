import { useState } from 'react'
import { Award } from 'lucide-react'
import { BarSeriesChart, ChartCard } from '@/components/charts'
import { DemoNotice } from '@/components/feedback'
import { Badge, Card, CardBody, CardHeader, ErrorState, PageHeader, Select, Skeleton, Table, TBody, Td, Th, THead, Tr } from '@/components/ui'
import { StatCard } from '@/features/dashboard/StatCard'
import { useQuery } from '@/hooks'
import { getModels } from '@/services'
import { formatPercent } from '@/utils'
import { BarChart3, Crosshair, Gauge, Percent, Target } from 'lucide-react'

const metricKeys = [['accuracy', 'Accuracy'], ['precision', 'Precision'], ['recall', 'Recall'], ['f1', 'F1-score'], ['roc_auc', 'ROC-AUC']] as const
const icons = [Percent, Target, Crosshair, BarChart3, Gauge]
const modelColors = ['#1a447f', '#2f6fe4', '#8db6ff', '#14b8a6']
const fmt = (v: number | null) => (v === null ? 'n/a' : v.toFixed(3))

export default function ModelPerformancePage() {
  const { data, loading, error, refetch } = useQuery(getModels)
  const [picked, setPicked] = useState<string>()
  const names = data ? Object.keys(data.models) : []
  const selected = picked && data?.models[picked] ? picked : data?.best_model ?? ''
  const m = data?.models[selected]

  return (
    <>
      <PageHeader title="Model performance" description="Test-set results for the four ensemble classifiers, as reported by the training pipeline." />
      <DemoNotice>Demo mode: showing a copy of your team's metrics.json. Connect the backend to read it live.</DemoNotice>
      {error && <Card><ErrorState title="Could not load model metrics" message={error.message} onRetry={refetch} /></Card>}
      {loading && <div role="status" className="space-y-4"><span className="sr-only">Loading</span><Skeleton className="h-24" /><Skeleton className="h-72" /></div>}
      {data && m && (
        <div className="space-y-6">
          <Card><CardBody className="flex flex-wrap items-end gap-4">
            <div className="w-full sm:w-64">
              <label htmlFor="model" className="mb-1.5 block text-sm font-medium text-ink">Inspect model</label>
              <Select id="model" value={selected} onChange={(e) => setPicked(e.target.value)}>
                {names.map((n) => <option key={n} value={n}>{n}{n === data.best_model ? ' (best)' : ''}</option>)}
              </Select>
            </div>
            {selected === data.best_model && <Badge variant="success"><Award className="h-3 w-3" aria-hidden />Best by F1-score, used for predictions</Badge>}
          </CardBody></Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {metricKeys.map(([k, label], i) => <StatCard key={k} label={label} value={m[k] === null ? 'n/a' : formatPercent(m[k])} hint={fmt(m[k])} icon={icons[i]} />)}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader title="Confusion matrix" description={`${selected}, test set. Rows are the actual class.`} />
              <CardBody>
                <div className="grid grid-cols-[auto_1fr_1fr] gap-2 text-center text-sm">
                  <div /><div className="text-muted">Predicted: stay</div><div className="text-muted">Predicted: churn</div>
                  <div className="self-center text-right text-muted">Actual: stay</div>
                  <Cell label="True negative" value={m.confusion_matrix[0][0]} good /><Cell label="False positive" value={m.confusion_matrix[0][1]} />
                  <div className="self-center text-right text-muted">Actual: churn</div>
                  <Cell label="False negative" value={m.confusion_matrix[1][0]} /><Cell label="True positive" value={m.confusion_matrix[1][1]} good />
                </div>
                {m.best_params && <p className="mt-4 text-xs text-muted">Tuned parameters: {Object.entries(m.best_params).map(([k, v]) => `${k}=${String(v)}`).join(', ')}</p>}
              </CardBody>
            </Card>
            <ChartCard title="Model comparison" description="All metrics, all models (test set)" loading={false}>
              <BarSeriesChart xKey="metric" height={250}
                series={names.map((n, i) => ({ key: n, label: n, color: modelColors[i % modelColors.length] }))}
                data={metricKeys.map(([k, label]) => ({ metric: label, ...Object.fromEntries(names.map((n) => [n, data.models[n][k] ?? 0])) }))} />
            </ChartCard>
          </div>

          <Card>
            <CardHeader title="Side-by-side" description="Cross-validated F1 was measured on SMOTE-balanced training data, so it reads higher than test F1. Use the test metrics as the headline." />
            <CardBody><Table>
              <THead><Tr><Th>Model</Th>{metricKeys.map(([, l]) => <Th key={l}>{l}</Th>)}<Th>CV F1 (mean ± sd)</Th></Tr></THead>
              <TBody>{names.map((n) => (
                <Tr key={n} className={n === selected ? 'bg-brand-50/60 dark:bg-brand-500/10' : ''}>
                  <Td className="font-medium">{n}{n === data.best_model && <Badge variant="success" className="ml-2">Best</Badge>}</Td>
                  {metricKeys.map(([k]) => <Td key={k}>{fmt(data.models[n][k])}</Td>)}
                  <Td>{data.models[n].cv_f1_mean !== undefined ? `${data.models[n].cv_f1_mean!.toFixed(3)} ± ${(data.models[n].cv_f1_std ?? 0).toFixed(3)}` : 'n/a'}</Td>
                </Tr>
              ))}</TBody>
            </Table></CardBody>
          </Card>
        </div>
      )}
    </>
  )
}

function Cell({ label, value, good }: { label: string; value: number; good?: boolean }) {
  return (
    <div className={`rounded-lg border p-4 ${good ? 'border-brand-300 bg-brand-50 dark:border-brand-500/40 dark:bg-brand-500/10' : 'border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10'}`}>
      <p className="text-2xl font-semibold text-ink">{value}</p><p className="text-xs text-muted">{label}</p>
    </div>
  )
}
