import type { z } from 'zod'
import { env } from '@/config/env'
import type { ApiError } from '@/types'

/**
 * The single switch between demo and real data.
 * - Demo mode (VITE_USE_MOCKS=true): uses `mock`, loaded lazily from src/mocks.
 * - API mode: uses `real`. A failure is thrown as an error; it never falls back to mock data.
 * Either way the payload is validated against the contract schema.
 */
export async function request<T>(
  schema: z.ZodType<T>,
  real: () => Promise<unknown>,
  mock: () => Promise<unknown>,
): Promise<T> {
  const raw = await (env.useMocks ? mock() : real())
  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    const error: ApiError = {
      message: 'The server response did not match the expected format. Check docs/API_CONTRACT.md.',
      details: parsed.error.issues,
    }
    throw error
  }
  return parsed.data
}
