import type { RouteObject } from 'react-router-dom'
import { DashboardLayout } from '@/layouts'
import AnalyticsPage from '@/pages/AnalyticsPage'
import BatchPredictionPage from '@/pages/BatchPredictionPage'
import DashboardPage from '@/pages/DashboardPage'
import DesignSystemPage from '@/pages/DesignSystemPage'
import ExplainabilityPage from '@/pages/ExplainabilityPage'
import ModelPerformancePage from '@/pages/ModelPerformancePage'
import NotFoundPage from '@/pages/NotFoundPage'
import PredictionPage from '@/pages/PredictionPage'
import PredictionResultPage from '@/pages/PredictionResultPage'
import RetentionPage from '@/pages/RetentionPage'
import SettingsPage from '@/pages/SettingsPage'
import type { RouteHandle } from '@/types'

const crumb = (label: string): RouteHandle => ({ crumb: label })

/** All pages render inside DashboardLayout. Breadcrumbs come from each route's `handle.crumb`. */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <DashboardPage />, handle: crumb('Overview') },
      {
        path: 'prediction', handle: crumb('Churn Prediction'),
        children: [
          { index: true, element: <PredictionPage /> },
          { path: 'result/:predictionId', element: <PredictionResultPage />, handle: crumb('Result') },
        ],
      },
      { path: 'batch', element: <BatchPredictionPage />, handle: crumb('Batch Prediction') },
      { path: 'models', element: <ModelPerformancePage />, handle: crumb('Model Performance') },
      { path: 'explainability', element: <ExplainabilityPage />, handle: crumb('Explainable AI') },
      { path: 'retention', element: <RetentionPage />, handle: crumb('Retention Insights') },
      { path: 'analytics', element: <AnalyticsPage />, handle: crumb('Analytics & Reports') },
      { path: 'settings', element: <SettingsPage />, handle: crumb('Settings') },
      { path: 'design-system', element: <DesignSystemPage />, handle: crumb('Design system') },
      { path: '*', element: <NotFoundPage />, handle: crumb('Not found') },
    ],
  },
]
