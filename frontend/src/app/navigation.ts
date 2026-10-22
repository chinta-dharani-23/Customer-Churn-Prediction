import { BrainCircuit, FileBarChart, FileUp, Gauge, HeartHandshake, LayoutDashboard, Settings, Target, type LucideIcon } from 'lucide-react'

export interface NavItem { path: string; label: string; icon: LucideIcon }

/** Sidebar items. Every entry here has a working page. */
export const navItems: NavItem[] = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/prediction', label: 'Churn Prediction', icon: Target },
  { path: '/batch', label: 'Batch Prediction', icon: FileUp },
  { path: '/models', label: 'Model Performance', icon: Gauge },
  { path: '/explainability', label: 'Explainable AI', icon: BrainCircuit },
  { path: '/retention', label: 'Retention Insights', icon: HeartHandshake },
  { path: '/analytics', label: 'Analytics & Reports', icon: FileBarChart },
  { path: '/settings', label: 'Settings', icon: Settings },
]
