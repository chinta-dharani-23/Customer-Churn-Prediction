import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { cn } from '@/utils'
import { ToastContext, type ToastApi, type ToastVariant as Variant } from './useToast'

interface ToastItem { id: number; variant: Variant; title: string; description?: string }

const icons = { success: CheckCircle2, error: XCircle, warning: AlertTriangle, info: Info }
const tones: Record<Variant, string> = {
  success: 'text-emerald-600 dark:text-emerald-400',
  error: 'text-red-600 dark:text-red-400',
  warning: 'text-amber-600 dark:text-amber-400',
  info: 'text-brand-600 dark:text-brand-300',
}

let nextId = 1

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const dismiss = useCallback((id: number) => setItems((cur) => cur.filter((t) => t.id !== id)), [])

  const api = useMemo<ToastApi>(() => {
    const push = (variant: Variant) => (title: string, description?: string) => {
      const id = nextId++
      setItems((cur) => [...cur.slice(-3), { id, variant, title, description }])
      setTimeout(() => dismiss(id), variant === 'error' ? 8000 : 5000)
    }
    return { success: push('success'), error: push('error'), warning: push('warning'), info: push('info') }
  }, [dismiss])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-end gap-2 sm:left-auto sm:w-96">
        {items.map((t) => {
          const Icon = icons[t.variant]
          return (
            <div
              key={t.id}
              role={t.variant === 'error' ? 'alert' : 'status'}
              className="pointer-events-auto flex w-full items-start gap-3 rounded-lg border border-line bg-surface p-4 shadow-lg"
            >
              <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', tones[t.variant])} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{t.title}</p>
                {t.description && <p className="mt-0.5 text-sm text-muted">{t.description}</p>}
              </div>
              <button type="button" aria-label="Dismiss notification" onClick={() => dismiss(t.id)} className="rounded p-1 text-muted hover:bg-canvas hover:text-ink">
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
