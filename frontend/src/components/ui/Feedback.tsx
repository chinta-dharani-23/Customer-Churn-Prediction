import type { ComponentType, ReactNode } from 'react'
import { AlertTriangle, Inbox, RefreshCw } from 'lucide-react'
import { cn } from '@/utils'
import { Button } from './Button'

/** Loading placeholder block. Wrap groups in role="status" with an sr-only label. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('animate-pulse rounded-md bg-line', className)} />
}

interface StateProps {
  title: string
  description?: string
  action?: ReactNode
  icon?: ComponentType<{ className?: string }>
}

function StateBlock({ icon: Icon, title, description, action, tone }: StateProps & { tone: string }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      {Icon && (
        <div className={cn('mb-4 flex h-12 w-12 items-center justify-center rounded-full', tone)}>
          <Icon className="h-6 w-6" aria-hidden />
        </div>
      )}
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function EmptyState({ icon = Inbox, ...props }: StateProps) {
  return <StateBlock icon={icon} tone="bg-canvas text-muted" {...props} />
}

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
}

/** Says what went wrong and offers a retry when one is possible. */
export function ErrorState({ title = 'Something went wrong', message, onRetry }: ErrorStateProps) {
  return (
    <div role="alert">
      <StateBlock
        icon={AlertTriangle}
        tone="bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400"
        title={title}
        description={message}
        action={onRetry && (
          <Button variant="secondary" onClick={onRetry}>
            <RefreshCw className="h-4 w-4" aria-hidden />
            Try again
          </Button>
        )}
      />
    </div>
  )
}
