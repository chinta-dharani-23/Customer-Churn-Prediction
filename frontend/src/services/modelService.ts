import { modelsResponseSchema } from '@/schemas/models'
import { apiClient } from './apiClient'
import { request } from './dataSource'
import { endpoints } from './endpoints'

export const getModels = () =>
  request(
    modelsResponseSchema,
    async () => (await apiClient.get(endpoints.models)).data,
    () => import('@/mocks/models').then((m) => m.modelsMock),
  )
