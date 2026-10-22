import type { ComponentProps } from 'react'
import { cn } from '@/utils'

/** Scrolls horizontally on small screens instead of breaking the layout. */
export function Table({ className, ...props }: ComponentProps<'table'>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className={cn('w-full text-left text-sm', className)} {...props} />
    </div>
  )
}
export const THead = (p: ComponentProps<'thead'>) => <thead className="bg-canvas text-xs text-muted" {...p} />
export const TBody = (p: ComponentProps<'tbody'>) => <tbody className="divide-y divide-line bg-surface" {...p} />
export const Tr = ({ className, ...p }: ComponentProps<'tr'>) => <tr className={cn('transition-colors hover:bg-canvas/60', className)} {...p} />
export const Th = ({ className, ...p }: ComponentProps<'th'>) => <th scope="col" className={cn('whitespace-nowrap px-4 py-3 font-medium', className)} {...p} />
export const Td = ({ className, ...p }: ComponentProps<'td'>) => <td className={cn('px-4 py-3 text-ink', className)} {...p} />
