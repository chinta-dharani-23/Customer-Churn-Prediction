import { Link, useParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, CheckCircle2, Download, Printer } from 'lucide-react'
import { DemoNotice } from '@/components/feedback'
import { Badge, buttonStyles, Button, Card, CardBody, CardHeader, ErrorState, PageHeader, Skeleton } from '@/components/ui'
import { fieldLabels } from '@/features/predictions/formConfig'
import { useQuery } from '@/hooks'
import type { PredictionInput } from '@/schemas/prediction'
import { getPrediction } from '@/services'
import { formatDateTime, formatPercent } from '@/utils'

export default function PredictionResultPage() {
  const { predictionId = '' } = useParams()
  const { data: r, loading, error, refetch } = useQuery(() => getPrediction(predictionId), [predictionId])

  const download = () => {
    if (!r) return
    const url = URL.createObjectURL(new Blob([JSON.stringify(r, null, 2)], { type: 'application/json' }))
    const a = Object.assign(document.createElement('a'), { href: url, download: `prediction-${r.predictionId}.json` })
    a.click()
    URL.revokeObjectURL(url)
  }
  const churn = r?.predictedClass === 'Churn'

  return (
    <>
      <PageHeader
        title="Prediction result"
        actions={
          <div data-print-hide className="flex flex-wrap gap-2">
            <Link to="/prediction" className={buttonStyles('secondary')}><ArrowLeft className="h-4 w-4" aria-hidden />New prediction</Link>
            <Button variant="secondary" onClick={() => window.print()} disabled={!r}><Printer className="h-4 w-4" aria-hidden />Print</Button>
            <Button variant="secondary" onClick={download} disabled={!r}><Download className="h-4 w-4" aria-hidden />Download JSON</Button>
          </div>
        }
      />
      <DemoNotice>Demo result: a fixed sample response, not calculated from the values you entered.</DemoNotice>
      {loading && <div role="status" className="space-y-4"><span className="sr-only">Loading result</span><Skeleton className="h-40 w-full" /><Skeleton className="h-56 w-full" /></div>}
      {error && <Card><ErrorState title="Could not load this prediction" message={error.message} onRetry={refetch} /></Card>}
      {r && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardBody className="flex flex-wrap items-center gap-5">
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${churn ? 'bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'}`}>
                {churn ? <AlertTriangle className="h-7 w-7" aria-hidden /> : <CheckCircle2 className="h-7 w-7" aria-hidden />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted">Model prediction</p>
                <p className="text-2xl font-semibold text-ink">{churn ? 'Likely to churn' : 'Not likely to churn'}</p>
                {r.riskCategory && <Badge variant={churn ? 'danger' : 'success'} className="mt-1">{r.riskCategory}</Badge>}
              </div>
              {r.probability !== null && (
                <div className="w-full sm:w-64">
                  <div className="flex justify-between text-sm"><span className="text-muted">Churn probability</span><span className="font-medium text-ink">{formatPercent(r.probability)}</span></div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-line" role="img" aria-label={`Churn probability ${formatPercent(r.probability)}`}>
                    <div className={`h-full ${churn ? 'bg-red-500' : 'bg-brand-500'}`} style={{ width: formatPercent(r.probability) }} />
                  </div>
                </div>
              )}
            </CardBody>
            <p className="border-t border-line px-5 py-3 text-sm text-muted">This is a model estimate, not a guarantee. Use it to support a decision made by a person.</p>
          </Card>

          <Card>
            <CardHeader title="Details" />
            <dl className="space-y-3 p-5 text-sm">
              {[['Prediction ID', r.predictionId], ['Model', r.model], ['Predicted', formatDateTime(r.createdAt)], ['Customer ID', r.customerId ?? 'Not provided']].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4"><dt className="text-muted">{k}</dt><dd className="break-all text-right font-medium text-ink">{v}</dd></div>
              ))}
            </dl>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader title="Customer summary" />
            <dl className="grid gap-x-8 gap-y-3 p-5 text-sm sm:grid-cols-2">
              {(Object.keys(r.input) as Array<keyof PredictionInput>).filter((k) => k !== 'customerId').map((k) => (
                <div key={k} className="flex justify-between gap-4 border-b border-line pb-2"><dt className="text-muted">{fieldLabels[k]}</dt><dd className="font-medium text-ink">{String(r.input[k])}</dd></div>
              ))}
            </dl>
          </Card>

          <Card>
            <CardHeader title="Factors reported by the model" description="These describe the prediction. They are not proven causes." />
            <CardBody>
              {r.topFactors?.length ? (
                <ul className="space-y-2 text-sm">
                  {r.topFactors.map((f) => <li key={f.feature} className="flex justify-between gap-3"><span className="text-ink">{f.feature}</span>{f.direction ? <Badge variant={f.direction === 'increases' ? 'danger' : 'success'}>{f.direction === 'increases' ? 'Raises churn score' : 'Lowers churn score'}</Badge> : f.importance !== undefined ? <span className="text-muted">Model importance {formatPercent(f.importance)}</span> : null}</li>)}
                </ul>
              ) : <p className="text-sm text-muted">The backend did not return contributing factors for this prediction.</p>}
              <Link to="/explainability" data-print-hide className={`${buttonStyles('secondary', 'sm')} mt-4`}>View detailed explanation</Link>
            </CardBody>
          </Card>
        </div>
      )}
    </>
  )
}
