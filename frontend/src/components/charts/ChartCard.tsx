import type { ReactNode } from 'react'
import { Card, CardBody, CardHeader, EmptyState, ErrorState, Skeleton } from '@/components/ui'
import type { ApiError } from '@/types'

interface ChartCardProps {
  title: string
  description?: string
  loading?: boolean
  error?: ApiError
  onRetry?: () => void
  empty?: boolean
  className?: string
  children: ReactNode
}

/** Wraps any chart with consistent loading, error, and empty states. */
export function ChartCard({ title, description, loading, error, onRetry, empty, className, children }: ChartCardProps) {
  return (
    <Card className={className}>
      <CardHeader title={title} description={description} />
      {loading ? (
        <CardBody><div role="status"><span className="sr-only">Loading {title}</span><Skeleton className="h-64 w-full" /></div></CardBody>
      ) : error ? (
        <ErrorState message={error.message} onRetry={onRetry} />
      ) : empty ? (
        <EmptyState title="No data available" description="This chart will fill in once the backend returns data." />
      ) : (
        <CardBody>{children}</CardBody>
      )}
    </Card>
  )
}
