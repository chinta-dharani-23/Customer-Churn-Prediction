import type { ComponentType, ReactNode } from 'react'
import { Card } from '@/components/ui'

interface StatCardProps { label: string; value: ReactNode; hint?: string; icon: ComponentType<{ className?: string }> }

export function StatCard({ label, value, hint, icon: Icon }: StatCardProps) {
  return (
    <Card className="flex items-start gap-4 p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300"><Icon className="h-5 w-5" aria-hidden /></div>
      <div className="min-w-0">
        <p className="text-sm text-muted">{label}</p>
        <p className="mt-0.5 text-2xl font-semibold tracking-tight text-ink">{value}</p>
        {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
      </div>
    </Card>
  )
}
