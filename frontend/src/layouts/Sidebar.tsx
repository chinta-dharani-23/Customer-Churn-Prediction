import { NavLink } from 'react-router-dom'
import { PanelLeftClose, PanelLeftOpen, RadioTower, X } from 'lucide-react'
import { navItems } from '@/app/navigation'
import { env } from '@/config/env'
import { cn } from '@/utils'

interface SidebarProps {
  collapsed: boolean
  mobileOpen: boolean
  onToggleCollapsed: () => void
  onCloseMobile: () => void
}

/** Icon-only when `collapsed` on md+ screens; always full-width inside the mobile drawer. */
export function Sidebar({ collapsed, mobileOpen, onToggleCollapsed, onCloseMobile }: SidebarProps) {
  const hideLabel = collapsed && 'md:hidden'
  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-40 bg-navy-950/60 md:hidden" onClick={onCloseMobile} aria-hidden />}
      <aside
        id="app-sidebar"
        aria-label="Sidebar"
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-navy-900 text-white transition-transform duration-200 dark:bg-navy-950',
          'md:sticky md:top-0 md:h-screen md:shrink-0 md:translate-x-0 md:transition-[width]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          collapsed ? 'md:w-[4.5rem]' : 'md:w-64',
        )}
      >
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500">
            <RadioTower className="h-5 w-5" aria-hidden />
          </div>
          <span className={cn('min-w-0 flex-1 truncate text-base font-semibold', hideLabel)}>{env.appName}</span>
          <button type="button" aria-label="Close navigation" onClick={onCloseMobile} className="rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-white md:hidden">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  end={path === '/'}
                  onClick={onCloseMobile}
                  title={collapsed ? label : undefined}
                  className={({ isActive }) =>
                    cn(
                      'flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors',
                      collapsed && 'md:justify-center md:px-0',
                      isActive
                        ? 'bg-white/15 text-white shadow-[inset_3px_0_0_var(--color-brand-300)]'
                        : 'text-white/70 hover:bg-white/10 hover:text-white',
                    )
                  }
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden />
                  <span className={cn('truncate', hideLabel)}>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden shrink-0 border-t border-white/10 p-3 md:block">
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-expanded={!collapsed}
            aria-controls="app-sidebar"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={cn('flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white', collapsed && 'justify-center px-0')}
          >
            {collapsed ? <PanelLeftOpen className="h-5 w-5" aria-hidden /> : <PanelLeftClose className="h-5 w-5" aria-hidden />}
            <span className={cn(collapsed && 'sr-only')}>Collapse sidebar</span>
          </button>
        </div>
      </aside>
    </>
  )
}
