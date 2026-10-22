import { useRef, useState } from 'react'
import { Download, FileSpreadsheet, UploadCloud } from 'lucide-react'
import { DemoNotice } from '@/components/feedback'
import { Badge, Button, Card, CardBody, CardHeader, ErrorState, PageHeader, Select, Table, TBody, Td, Th, THead, Tr, useToast } from '@/components/ui'
import { downloadCsv, templateColumns, templateCsv, toCsv } from '@/features/predictions/batchCsv'
import type { BatchResponse } from '@/schemas/batch'
import { predictBatch, saveLastBatch } from '@/services'
import type { ApiError } from '@/types'
import { cn, formatPercent } from '@/utils'

const MAX_MB = 10
const riskVariant = { High: 'danger', Medium: 'warning', Low: 'success' } as const

export default function BatchPredictionPage() {
  const toast = useToast()
  const input = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File>()
  const [fileError, setFileError] = useState<string>()
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const [result, setResult] = useState<BatchResponse>()
  const [error, setError] = useState<string>()
  const [risk, setRisk] = useState('all')
  const [shown, setShown] = useState(25)

  const pick = (f?: File) => {
    setResult(undefined); setError(undefined)
    if (!f) return
    if (!f.name.toLowerCase().endsWith('.csv')) { setFile(undefined); setFileError('Choose a .csv file.'); return }
    if (f.size > MAX_MB * 1024 * 1024) { setFile(undefined); setFileError(`The file is larger than ${MAX_MB} MB.`); return }
    setFileError(undefined); setFile(f)
  }

  const run = async () => {
    if (!file) return
    setError(undefined); setProgress(0)
    try {
      const r = await predictBatch(file, setProgress)
      setResult(r); saveLastBatch(r); setShown(25); setRisk('all')
      toast.success('Scoring complete', `${r.count} customers scored.`)
    } catch (e) { setError((e as ApiError).message) } finally { setProgress(null) }
  }

  const rows = result?.results.filter((r) => risk === 'all' || r.risk_level === risk) ?? []
  const tally = (k: string) => result?.results.filter((r) => r.risk_level === k).length ?? 0
  const busy = progress !== null

  return (
    <>
      <PageHeader title="Batch prediction" description="Upload a CSV of customers to rank them by churn risk. Scoring is done by the backend model." />
      <DemoNotice>Demo mode: the results below are a fixed sample, not computed from your file.</DemoNotice>
      <div className="space-y-6">
        <Card>
          <CardHeader title="Upload customers" description={`CSV only, up to ${MAX_MB} MB. Columns must match the template.`}
            action={<Button variant="secondary" size="sm" onClick={() => downloadCsv('churn-batch-template.csv', templateCsv())}><Download className="h-4 w-4" aria-hidden />Template</Button>} />
          <CardBody className="space-y-4">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); pick(e.dataTransfer.files[0]) }}
              className={cn('flex flex-col items-center rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors', dragging ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-line')}
            >
              {file ? <FileSpreadsheet className="h-10 w-10 text-brand-600" aria-hidden /> : <UploadCloud className="h-10 w-10 text-muted" aria-hidden />}
              <p className="mt-3 text-sm font-medium text-ink">{file ? file.name : 'Drag and drop a CSV here'}</p>
              <p className="text-xs text-muted">{file ? `${(file.size / 1024).toFixed(1)} KB` : 'or choose a file from your computer'}</p>
              <input ref={input} type="file" accept=".csv,text/csv" className="sr-only" aria-label="Choose CSV file" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = '' }} />
              <Button variant="secondary" size="sm" className="mt-4" onClick={() => input.current?.click()} disabled={busy}>Choose file</Button>
            </div>
            {fileError && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{fileError}</p>}
            {busy && (
              <div role="status">
                <div className="h-2 overflow-hidden rounded-full bg-line"><div className="h-full bg-brand-500 transition-all" style={{ width: `${progress}%` }} /></div>
                <p className="mt-1 text-xs text-muted">{progress === 100 ? 'Upload complete. Scoring on the server…' : `Uploading ${progress}%`}</p>
              </div>
            )}
            <div className="flex justify-end"><Button onClick={run} loading={busy} disabled={!file}>{busy ? 'Scoring…' : 'Upload and predict'}</Button></div>
          </CardBody>
        </Card>

        {error && <Card><ErrorState title="The upload could not be scored" message={error} onRetry={run} /></Card>}

        {result && (
          <Card>
            <CardHeader title={`Results: ${result.count} customers`} description="Highest churn probability first. Treat these as estimates that support human review."
              action={<Button variant="secondary" size="sm" onClick={() => downloadCsv('churn-batch-results.csv', toCsv([['customerID', 'churn_probability', 'risk_level'], ...result.results.map((r) => [r.customerID, r.churn_probability, r.risk_level])]))}><Download className="h-4 w-4" aria-hidden />Download CSV</Button>} />
            <CardBody className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-wrap gap-2">{(['High', 'Medium', 'Low'] as const).map((k) => <Badge key={k} variant={riskVariant[k]}>{k}: {tally(k)}</Badge>)}</div>
                <div className="w-44"><label htmlFor="risk" className="sr-only">Filter by risk</label>
                  <Select id="risk" value={risk} onChange={(e) => { setRisk(e.target.value); setShown(25) }}><option value="all">All risk levels</option><option>High</option><option>Medium</option><option>Low</option></Select></div>
              </div>
              <Table>
                <THead><Tr><Th>Customer ID</Th><Th>Churn probability</Th><Th>Risk level</Th></Tr></THead>
                <TBody>{rows.slice(0, shown).map((r, i) => (
                  <Tr key={`${r.customerID}-${i}`}>
                    <Td className="font-medium">{r.customerID}</Td>
                    <Td><div className="flex items-center gap-3"><div className="h-1.5 w-28 overflow-hidden rounded-full bg-line" aria-hidden><div className="h-full bg-red-500" style={{ width: formatPercent(r.churn_probability) }} /></div>{formatPercent(r.churn_probability)}</div></Td>
                    <Td><Badge variant={riskVariant[r.risk_level as keyof typeof riskVariant] ?? 'neutral'}>{r.risk_level}</Badge></Td>
                  </Tr>
                ))}</TBody>
              </Table>
              {rows.length === 0 && <p className="text-center text-sm text-muted">No customers match this filter.</p>}
              {shown < rows.length && <div className="text-center"><Button variant="secondary" size="sm" onClick={() => setShown((n) => n + 25)}>Show more ({rows.length - shown} left)</Button></div>}
            </CardBody>
          </Card>
        )}
        <p className="text-xs text-muted">Required columns: {templateColumns.join(', ')}.</p>
      </div>
    </>
  )
}
