import type { ComponentProps } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils'
import { buttonStyles, iconButtonStyles, type Size, type Variant } from './buttonStyles'

interface ButtonProps extends ComponentProps<'button'> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

export function Button({ variant, size, loading, disabled, className, children, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(buttonStyles(variant, size), className)}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  )
}

/** Icon-only button. `label` is required so it always has an accessible name. */
export function IconButton({ label, className, children, type = 'button', ...props }: ComponentProps<'button'> & { label: string }) {
  return (
    <button type={type} aria-label={label} title={label} className={cn(iconButtonStyles, className)} {...props}>
      {children}
    </button>
  )
}
