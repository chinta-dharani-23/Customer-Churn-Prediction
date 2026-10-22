import type { ComponentProps } from 'react'
import { cn } from '@/utils'

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

const styles: Record<BadgeVariant, string> = {
  success: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
  warning: 'bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  danger: 'bg-red-50 text-red-800 dark:bg-red-500/15 dark:text-red-300',
  info: 'bg-brand-50 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300',
  neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300',
}
const dots: Record<BadgeVariant, string> = {
  success: 'bg-emerald-500', warning: 'bg-amber-500', danger: 'bg-red-500', info: 'bg-brand-500', neutral: 'bg-slate-400',
}

/** Status badge. Always pair color with text so meaning never depends on color alone. */
export function Badge({ variant = 'neutral', className, children, ...props }: ComponentProps<'span'> & { variant?: BadgeVariant }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', styles[variant], className)} {...props}>
      <span className={cn('h-1.5 w-1.5 rounded-full', dots[variant])} aria-hidden />
      {children}
    </span>
  )
}
