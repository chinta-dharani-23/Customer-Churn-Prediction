import { dashboardStatsSchema, healthSchema } from '@/schemas/dashboard'
import { apiClient } from './apiClient'
import { request } from './dataSource'
import { endpoints } from './endpoints'

export const getDashboard = () =>
  request(
    dashboardStatsSchema,
    async () => (await apiClient.get(endpoints.dashboard)).data,
    () => import('@/mocks/dashboard').then((m) => m.dashboardMock),
  )

export const getHealth = () =>
  request(
    healthSchema,
    async () => (await apiClient.get(endpoints.health)).data,
    () => import('@/mocks/dashboard').then((m) => m.healthMock),
  )
