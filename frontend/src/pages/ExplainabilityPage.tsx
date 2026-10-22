import { Link } from 'react-router-dom'
import { Brain } from 'lucide-react'
import { DemoNotice } from '@/components/feedback'
import { Badge, buttonStyles, Card, CardBody, CardHeader, EmptyState, ErrorState, PageHeader, Skeleton } from '@/components/ui'
import { NarrativePanel } from '@/features/explainability/NarrativePanel'
import { useQuery } from '@/hooks'
import { getGlobalExplanation, getPrediction } from '@/services'
import { formatPercent } from '@/utils'

const lastId = () => { try { return sessionStorage.getItem('prediction:last') } catch { return null } }

export default function ExplainabilityPage() {
  const id = lastId()
  const { data: r, loading, error, refetch } = useQuery(() => (id ? getPrediction(id) : Promise.resolve(null)), [id])
  const global = useQuery(getGlobalExplanation)
  const factors = r?.topFactors ?? []
  const hasDirection = factors.some((f) => f.direction)
  const gMax = Math.max(0.0001, ...(global.data?.features ?? []).map((f) => f.mean_abs_shap))
  const max = Math.max(0.0001, ...factors.map((f) => f.importance ?? 0))

  return (
    <>
      <PageHeader title="Explainable AI" description="Why the model scored a customer the way it did." />
      <DemoNotice>Demo mode: everything on this page is a fixed sample, not real SHAP output.</DemoNotice>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader title="Latest prediction explained" description="Local explanation for the most recent prediction made in this session." />
          {loading ? <CardBody><Skeleton className="h-32" /></CardBody>
            : error ? <ErrorState message={error.message} onRetry={refetch} />
            : !r ? <EmptyState icon={Brain} title="No prediction to explain yet" description="Run a prediction first, and its contributing factors will appear here." action={<Link to="/prediction" className={buttonStyles()}>Predict churn</Link>} />
            : (
              <CardBody className="space-y-5">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <Badge variant={r.predictedClass === 'Churn' ? 'danger' : 'success'}>{r.predictedClass}</Badge>
                  {r.probability !== null && <span className="text-muted">Churn probability <b className="text-ink">{formatPercent(r.probability)}</b></span>}
                  {r.riskCategory && <span className="text-muted">Risk level <b className="text-ink">{r.riskCategory}</b></span>}
                  <span className="text-muted">Model <b className="text-ink">{r.model}</b></span>
                </div>
                {factors.length === 0 ? <p className="text-sm text-muted">The backend returned no factors for this prediction.</p> : (
                  <ul className="space-y-3">{factors.map((f) => (
                    <li key={f.feature}>
                      <div className="flex justify-between text-sm"><span className="font-medium text-ink">{f.feature}</span>
                        {f.direction ? <Badge variant={f.direction === 'increases' ? 'danger' : 'success'}>{f.direction === 'increases' ? 'Raises churn score' : 'Lowers churn score'}</Badge> : <span className="text-muted">{f.importance !== undefined ? formatPercent(f.importance) : ''}</span>}</div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-line" aria-hidden><div className="h-full bg-brand-500" style={{ width: `${((f.importance ?? 0) / max) * 100}%` }} /></div>
                    </li>
                  ))}</ul>
                )}
                <p className="rounded-md bg-canvas px-3 py-2 text-sm text-muted">{hasDirection
                  ? "How to read this: each bar is the size of that feature's SHAP contribution to this customer's score, and the label shows whether it pushed the score toward or away from churn. This describes the model's prediction; it does not prove the feature caused churn."
                  : "How to read this: each bar is the model's overall importance of a feature, weighted by this customer's value. It shows what the model relied on, not what caused churn, and has no direction. This is not a SHAP explanation."}</p>
              </CardBody>
            )}
        </Card>
        {r && <NarrativePanel key={r.predictionId} predictionId={r.predictionId} />}
        <Card className="lg:col-span-2">
          <CardHeader title="Global explanation (SHAP)" description="Which features matter most across customers." />
          {global.loading ? <CardBody><Skeleton className="h-40" /></CardBody>
            : global.error ? <ErrorState message={global.error.message} onRetry={global.refetch} />
            : global.data && (
              <CardBody className="space-y-4">
                <ul className="space-y-2.5">{global.data.features.slice(0, 10).map((f) => (
                  <li key={f.feature} className="grid grid-cols-[8rem_1fr_3rem] items-center gap-3 text-sm sm:grid-cols-[11rem_1fr_3.5rem]">
                    <span className="truncate font-medium text-ink">{f.feature}</span>
                    <div className="h-2 overflow-hidden rounded-full bg-line" aria-hidden><div className="h-full bg-navy-700 dark:bg-brand-500" style={{ width: `${(f.mean_abs_shap / gMax) * 100}%` }} /></div>
                    <span className="text-right text-muted">{f.mean_abs_shap.toFixed(2)}</span>
                  </li>
                ))}</ul>
                <p className="rounded-md bg-canvas px-3 py-2 text-sm text-muted">Each value is the average absolute SHAP contribution over {global.data.sample_size} sampled customers. Larger means the feature moves the model's score more, in either direction. It describes the model, not causes of churn.</p>
              </CardBody>
            )}
        </Card>
      </div>
    </>
  )
}
