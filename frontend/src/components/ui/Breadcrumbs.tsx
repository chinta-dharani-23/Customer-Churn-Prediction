import { Fragment } from 'react'
import { Link, useMatches } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { RouteHandle } from '@/types'

/** Built from route `handle.crumb` values, so nested routes get breadcrumbs automatically. */
export function Breadcrumbs() {
  const matches = useMatches()
  const crumbs = matches
    .filter((m) => (m.handle as RouteHandle | undefined)?.crumb)
    .map((m) => ({ label: (m.handle as RouteHandle).crumb!, to: m.pathname }))

  if (crumbs[0]?.to !== '/') crumbs.unshift({ label: 'Overview', to: '/' })

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex items-center gap-1.5 text-sm">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1
          return (
            <Fragment key={c.to}>
              {i > 0 && <ChevronRight className="h-4 w-4 shrink-0 text-muted" aria-hidden />}
              <li className="min-w-0 truncate">
                {last ? (
                  <span aria-current="page" className="font-medium text-ink">{c.label}</span>
                ) : (
                  <Link to={c.to} className="text-muted transition-colors hover:text-ink">{c.label}</Link>
                )}
              </li>
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
