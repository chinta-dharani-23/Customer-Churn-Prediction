import { FlaskConical } from 'lucide-react'
import { env } from '@/config/env'

/** Pill shown in the topbar while VITE_USE_MOCKS=true. */
export function DemoBadge() {
  if (!env.useMocks) return null
  return (
    <span title="Sample data is shown. Nothing here comes from the real models." className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900 dark:bg-amber-500/20 dark:text-amber-300">
      <FlaskConical className="h-3.5 w-3.5" aria-hidden />
      DEMO MODE
    </span>
  )
}

/** Banner for any page or card showing sample values. Renders nothing outside demo mode. */
export function DemoNotice({ children = 'Demo data: sample values for development, not results from the project models.' }: { children?: string }) {
  if (!env.useMocks) return null
  return (
    <p role="note" className="mb-4 flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
      <FlaskConical className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      {children}
    </p>
  )
}
