import { batchResponseSchema } from '@/schemas/batch'
import { apiClient } from './apiClient'
import { request } from './dataSource'
import { endpoints } from './endpoints'

/** Uploads a CSV for scoring. `onProgress` receives 0 to 100 while the file uploads. */
export const predictBatch = (file: File, onProgress?: (percent: number) => void) =>
  request(
    batchResponseSchema,
    async () => {
      const form = new FormData()
      form.append('file', file)
      const { data } = await apiClient.post(endpoints.predictBatch, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120_000,
        onUploadProgress: (e) => onProgress?.(e.total ? Math.round((e.loaded / e.total) * 100) : 0),
      })
      return data
    },
    () => import('@/mocks/batch').then((m) => m.batchMock),
  )
