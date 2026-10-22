import { useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils'
import { iconButtonStyles } from './buttonStyles'

interface DropdownProps {
  label: string
  trigger: ReactNode
  children: ReactNode
  align?: 'left' | 'right'
  /** "menu" for action lists; "dialog" for free-form panels such as notifications. */
  role?: 'menu' | 'dialog'
  triggerClassName?: string
  panelClassName?: string
}

/** Popover with click-outside and Esc handling; Esc returns focus to the trigger. */
export function Dropdown({ label, trigger, children, align = 'right', role = 'menu', triggerClassName = iconButtonStyles, panelClassName }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      root.current?.querySelector('button')?.focus()
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={root} className="relative">
      <button type="button" aria-label={label} title={label} aria-haspopup={role} aria-expanded={open} onClick={() => setOpen((o) => !o)} className={triggerClassName}>
        {trigger}
      </button>
      {open && (
        <div
          role={role}
          aria-label={label}
          onClick={role === 'menu' ? () => setOpen(false) : undefined}
          className={cn('absolute top-full z-50 mt-2 min-w-56 rounded-lg border border-line bg-surface p-1.5 shadow-lg', align === 'right' ? 'right-0' : 'left-0', panelClassName)}
        >
          {children}
        </div>
      )}
    </div>
  )
}

interface DropdownItemProps {
  children: ReactNode
  icon?: ComponentType<{ className?: string }>
  to?: string
  disabled?: boolean
  onSelect?: () => void
}

export function DropdownItem({ children, icon: Icon, to, disabled, onSelect }: DropdownItemProps) {
  const cls = cn(
    'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-ink transition-colors hover:bg-canvas',
    disabled && 'pointer-events-none opacity-50',
  )
  const content = (<>{Icon && <Icon className="h-4 w-4 text-muted" aria-hidden />}{children}</>)
  return to ? (
    <Link to={to} role="menuitem" className={cls}>{content}</Link>
  ) : (
    <button type="button" role="menuitem" disabled={disabled} onClick={onSelect} className={cls}>{content}</button>
  )
}
