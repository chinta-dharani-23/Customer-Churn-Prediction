import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DemoNotice } from '@/components/feedback'
import { Badge, buttonStyles, Card, CardBody, CardHeader, EmptyState, Input, PageHeader, Select, Table, TBody, Td, Th, THead, Tr } from '@/components/ui'
import { loadLastBatch } from '@/services'
import { formatDateTime, formatPercent } from '@/utils'

const STATUSES = ['Pending', 'Contacted', 'Retained', 'Closed'] as const
type Status = (typeof STATUSES)[number]
const KEY = 'retention:status'

/** Transparent advisory rule on the backend's churn probability only. It is not a model output. */
const advice = (p: number) => (p >= 0.8 ? 'Priority personal outreach' : p >= 0.66 ? 'Proactive contact and plan review' : 'Add to monitoring list')

function loadStatuses(): Record<string, Status> {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '{}') } catch { return {} }
}

export default function RetentionPage() {
  const [batch] = useState(loadLastBatch)
  const [statuses, setStatuses] = useState(loadStatuses)
  const [level, setLevel] = useState('High')
  const [search, setSearch] = useState('')

  const setStatus = (id: string, status: Status) => {
    const next = { ...statuses, [id]: status }
    setStatuses(next)
    try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* kept in memory only */ }
  }
  const rows = useMemo(
    () => (batch?.result.results ?? []).filter((r) => (level === 'High' ? r.risk_level === 'High' : r.risk_level !== 'Low') && r.customerID.toLowerCase().includes(search.trim().toLowerCase())),
    [batch, level, search],
  )

  return (
    <>
      <PageHeader title="Retention insights" description="Review the customers your latest batch upload flagged as higher risk, and track follow-up." />
      <DemoNotice>Demo mode: this list comes from the fixed sample batch, not from your data.</DemoNotice>
      {!batch ? (
        <Card><EmptyState title="No batch results yet" description="Upload a customer CSV on the Batch Prediction page. The higher-risk customers will be listed here." action={<Link to="/batch" className={buttonStyles()}>Go to batch prediction</Link>} /></Card>
      ) : (
        <Card>
          <CardHeader title={`${rows.length} customers to review`} description={`From the batch uploaded ${formatDateTime(batch.at)}. Risk levels come from the backend model.`} />
          <CardBody className="space-y-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="w-full sm:w-64"><label htmlFor="q" className="mb-1.5 block text-sm font-medium text-ink">Search customer ID</label><Input id="q" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="e.g. 7590" /></div>
              <div className="w-full sm:w-52"><label htmlFor="lvl" className="mb-1.5 block text-sm font-medium text-ink">Show</label><Select id="lvl" value={level} onChange={(e) => setLevel(e.target.value)}><option value="High">High risk only</option><option value="HM">High and medium risk</option></Select></div>
            </div>
            <p role="note" className="rounded-md bg-canvas px-3 py-2 text-sm text-muted">Suggested actions are simple rules on the churn probability, offered as recommendations for human review. They do not predict that an action will prevent churn. Follow-up status is saved in this browser only.</p>
            {rows.length === 0 ? <p className="py-6 text-center text-sm text-muted">No customers match.</p> : (
              <Table>
                <THead><Tr><Th>Customer ID</Th><Th>Churn probability</Th><Th>Risk</Th><Th>Suggested action</Th><Th>Follow-up</Th></Tr></THead>
                <TBody>{rows.map((r) => (
                  <Tr key={r.customerID}>
                    <Td className="font-medium">{r.customerID}</Td><Td>{formatPercent(r.churn_probability)}</Td>
                    <Td><Badge variant={r.risk_level === 'High' ? 'danger' : 'warning'}>{r.risk_level}</Badge></Td>
                    <Td>{advice(r.churn_probability)}</Td>
                    <Td><Select aria-label={`Follow-up status for ${r.customerID}`} value={statuses[r.customerID] ?? 'Pending'} onChange={(e) => setStatus(r.customerID, e.target.value as Status)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</Select></Td>
                  </Tr>
                ))}</TBody>
              </Table>
            )}
          </CardBody>
        </Card>
      )}
    </>
  )
}
