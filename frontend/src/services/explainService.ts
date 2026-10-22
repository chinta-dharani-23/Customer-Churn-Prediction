import { globalExplanationSchema } from '@/schemas/explain'
import { apiClient } from './apiClient'
import { request } from './dataSource'
import { endpoints } from './endpoints'

export const getGlobalExplanation = () =>
  request(
    globalExplanationSchema,
    async () => (await apiClient.get(endpoints.explainGlobal)).data,
    () => import('@/mocks/explain').then((m) => m.globalExplanationMock),
  )
