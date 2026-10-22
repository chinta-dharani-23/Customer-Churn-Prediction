import { Bell, LogOut, Menu, Moon, Search, Settings, Sun, UserRound } from 'lucide-react'
import { Breadcrumbs, Dropdown, DropdownItem, IconButton } from '@/components/ui'
import { DemoBadge } from '@/components/feedback'
import { useTheme } from '@/hooks'

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'

  return (
    <header data-print-hide className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-surface/95 px-4 backdrop-blur sm:px-6">
      <IconButton label="Open navigation" onClick={onOpenMenu} aria-controls="app-sidebar" className="md:hidden">
        <Menu className="h-5 w-5" aria-hidden />
      </IconButton>

      <div className="min-w-0 flex-1"><Breadcrumbs /></div>
      <DemoBadge />

      {/* Contextual area: search is wired up with the Customer Explorer (Module 4). */}
      <div className="relative hidden w-64 lg:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
        <input
          type="search"
          disabled
          aria-label="Search customers (available in Module 4)"
          placeholder="Search customers"
          className="h-9 w-full cursor-not-allowed rounded-md border border-line bg-canvas pl-9 pr-3 text-sm placeholder:text-muted disabled:opacity-70"
        />
      </div>

      <Dropdown label="Notifications" role="dialog" trigger={<Bell className="h-5 w-5" aria-hidden />} panelClassName="w-72">
        <p className="px-3 py-2 text-sm font-medium text-ink">Notifications</p>
        <p className="px-3 pb-3 text-sm text-muted">You are all caught up. New alerts will appear here.</p>
      </Dropdown>

      <IconButton label={dark ? 'Switch to light theme' : 'Switch to dark theme'} onClick={toggle}>
        {dark ? <Sun className="h-5 w-5" aria-hidden /> : <Moon className="h-5 w-5" aria-hidden />}
      </IconButton>

      <Dropdown
        label="Account menu"
        trigger={<span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-800 text-white"><UserRound className="h-4 w-4" aria-hidden /></span>}
      >
        <div className="border-b border-line px-3 py-2">
          <p className="text-sm font-medium text-ink">Guest user</p>
          <p className="text-xs text-muted">Sign-in is not set up yet</p>
        </div>
        <div className="pt-1.5">
          <DropdownItem to="/settings" icon={Settings}>Settings</DropdownItem>
          <DropdownItem icon={LogOut} disabled>Sign out</DropdownItem>
        </div>
      </Dropdown>
    </header>
  )
}
