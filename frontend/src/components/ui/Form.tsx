import type { ComponentProps, ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils'

const control =
  'block w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink shadow-sm transition-colors placeholder:text-muted/70 focus-visible:border-brand-500 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-brand-500/40 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-red-500'

interface FieldProps {
  label: string
  htmlFor: string
  hint?: string
  error?: string
  children: ReactNode
}

/** Label + control + hint/error. Give the control aria-describedby={`${htmlFor}-hint`} / `-error`. */
export function Field({ label, htmlFor, hint, error, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-ink">{label}</label>
      {children}
      {hint && !error && <p id={`${htmlFor}-hint`} className="text-xs text-muted">{hint}</p>}
      {error && <p id={`${htmlFor}-error`} role="alert" className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}

type Invalid = { invalid?: boolean }

export function Input({ invalid, className, ...props }: ComponentProps<'input'> & Invalid) {
  return <input aria-invalid={invalid || undefined} className={cn(control, 'h-10', className)} {...props} />
}

export function Textarea({ invalid, className, ...props }: ComponentProps<'textarea'> & Invalid) {
  return <textarea aria-invalid={invalid || undefined} className={cn(control, 'min-h-24', className)} {...props} />
}

export function Select({ invalid, className, children, ...props }: ComponentProps<'select'> & Invalid) {
  return (
    <div className="relative">
      <select aria-invalid={invalid || undefined} className={cn(control, 'h-10 appearance-none pr-9', className)} {...props}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
    </div>
  )
}
