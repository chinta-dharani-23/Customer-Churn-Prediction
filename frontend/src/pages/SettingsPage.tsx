import { useState } from 'react'
import { Plug } from 'lucide-react'
import { Badge, Button, Card, CardBody, CardHeader, PageHeader } from '@/components/ui'
import { env } from '@/config/env'
import { getHealth } from '@/services'
import type { ApiError } from '@/types'

type Check = { state: 'idle' } | { state: 'checking' } | { state: 'ok' } | { state: 'error'; message: string }

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line py-3 text-sm last:border-0"><dt className="text-muted">{k}</dt><dd className="break-all text-right font-medium text-ink">{children}</dd></div>
}

export default function SettingsPage() {
  const [check, setCheck] = useState<Check>({ state: 'idle' })
  const run = async () => {
    setCheck({ state: 'checking' })
    try { await getHealth(); setCheck({ state: 'ok' }) } catch (e) { setCheck({ state: 'error', message: (e as ApiError).message }) }
  }
  return (
    <>
      <PageHeader title="Settings" description="Connection status and application information." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Backend connection" description="Configured with environment variables in .env" />
          <CardBody>
            <dl>
              <Row k="Data mode">{env.useMocks ? <Badge variant="warning">Demo mode (sample data)</Badge> : <Badge variant="info">Live API</Badge>}</Row>
              <Row k="API base URL">{env.apiBaseUrl}</Row>
              <Row k="Request timeout">{env.apiTimeoutMs / 1000}s</Row>
            </dl>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button variant="secondary" onClick={run} loading={check.state === 'checking'}><Plug className="h-4 w-4" aria-hidden />Check connection</Button>
              <div role="status" aria-live="polite" className="text-sm">
                {check.state === 'ok' && (env.useMocks ? <span className="text-muted">Demo mode: the backend was not contacted.</span> : <Badge variant="success">Backend reachable</Badge>)}
                {check.state === 'error' && <span className="text-red-600 dark:text-red-400">{check.message}</span>}
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Application" />
          <CardBody><dl>
            <Row k="Name">{env.appName}</Row>
            <Row k="Build mode">{env.mode}</Row>
            <Row k="Profile">Guest user (sign-in is not set up)</Row>
            <Row k="Theme">Use the sun/moon button in the top bar</Row>
          </dl></CardBody>
        </Card>
      </div>
    </>
  )
}
