import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import {
  Badge, Button, Card, CardBody, CardHeader, ConfirmDialog, EmptyState, ErrorState,
  Field, Input, PageHeader, Select, Skeleton, Table, TBody, Td, Textarea, Th, THead, Tr, useToast,
} from '@/components/ui'

/** Development preview of the shared UI kit. Sample values below are illustrative labels, not real data. */
export default function DesignSystemPage() {
  const toast = useToast()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)

  const confirm = () => {
    setBusy(true)
    setTimeout(() => { setBusy(false); setConfirmOpen(false); toast.success('Dataset deleted', 'Sample action: nothing was actually removed.') }, 800)
  }

  return (
    <>
      <PageHeader title="Design system" description="Preview of the shared components every module builds on." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Buttons and badges" />
          <CardBody className="space-y-5">
            <div className="flex flex-wrap gap-3">
              <Button><Plus className="h-4 w-4" aria-hidden />Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
              <Button size="sm">Small</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="success">Active</Badge>
              <Badge variant="warning">Pending</Badge>
              <Badge variant="danger">Failed</Badge>
              <Badge variant="info">Processing</Badge>
              <Badge>Draft</Badge>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Form controls" />
          <CardBody className="space-y-4">
            <Field label="Customer ID" htmlFor="ds-id" hint="Use the ID from your dataset.">
              <Input id="ds-id" placeholder="e.g. 7590-VHVEG" aria-describedby="ds-id-hint" />
            </Field>
            <Field label="Contract type" htmlFor="ds-contract">
              <Select id="ds-contract" defaultValue=""><option value="" disabled>Select one</option><option>Month-to-month</option><option>One year</option><option>Two year</option></Select>
            </Field>
            <Field label="Monthly charges" htmlFor="ds-err" error="Enter a number greater than 0.">
              <Input id="ds-err" invalid defaultValue="-5" aria-describedby="ds-err-error" />
            </Field>
            <Field label="Notes" htmlFor="ds-notes"><Textarea id="ds-notes" /></Field>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Table" description="Scrolls sideways on small screens." />
          <CardBody>
            <Table>
              <THead><Tr><Th>Item</Th><Th>Status</Th><Th>Note</Th></Tr></THead>
              <TBody>
                <Tr><Td>Sample row A</Td><Td><Badge variant="success">Active</Badge></Td><Td>Placeholder text</Td></Tr>
                <Tr><Td>Sample row B</Td><Td><Badge variant="warning">Pending</Badge></Td><Td>Placeholder text</Td></Tr>
              </TBody>
            </Table>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Loading state" action={<Button size="sm" variant="secondary" onClick={() => setLoading((l) => !l)}>{loading ? 'Show content' : 'Show skeleton'}</Button>} />
          <CardBody>
            {loading ? (
              <div role="status" className="space-y-3"><span className="sr-only">Loading</span><Skeleton className="h-5 w-1/3" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-4/5" /></div>
            ) : (<p className="text-sm text-muted">Content replaces the skeleton once data has loaded.</p>)}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Dialog and toasts" />
          <CardBody className="flex flex-wrap gap-3">
            <Button variant="danger" onClick={() => setConfirmOpen(true)}><Trash2 className="h-4 w-4" aria-hidden />Confirm dialog</Button>
            <Button variant="secondary" onClick={() => toast.success('Saved', 'Your changes were saved.')}>Success</Button>
            <Button variant="secondary" onClick={() => toast.error('Upload failed', 'Check the file format and try again.')}>Error</Button>
            <Button variant="secondary" onClick={() => toast.warning('Large file', 'Processing may take a while.')}>Warning</Button>
            <Button variant="secondary" onClick={() => toast.info('Heads up', 'This is an informational message.')}>Info</Button>
          </CardBody>
        </Card>

        <Card><CardHeader title="Empty state" /><EmptyState title="No datasets yet" description="Upload a dataset to get started." action={<Button><Plus className="h-4 w-4" aria-hidden />Upload dataset</Button>} /></Card>
        <Card><CardHeader title="Error state" /><ErrorState message="The server did not respond. Check that the API is running." onRetry={() => toast.info('Retrying…')} /></Card>
      </div>

      <ConfirmDialog
        open={confirmOpen} tone="danger" loading={busy}
        title="Delete this dataset?" description="This is a sample dialog. Real delete actions will use the same component."
        confirmLabel="Delete" onConfirm={confirm} onCancel={() => !busy && setConfirmOpen(false)}
      />
    </>
  )
}
