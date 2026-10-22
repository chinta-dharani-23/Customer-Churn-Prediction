import type { BatchResponse } from '@/schemas/batch'

const KEY = 'batch:last'

/** Keeps the latest batch result for this browser session so Retention Insights can reuse it. */
export function saveLastBatch(result: BatchResponse) {
  try { sessionStorage.setItem(KEY, JSON.stringify({ result, at: new Date().toISOString() })) } catch { /* optional */ }
}

export function loadLastBatch(): { result: BatchResponse; at: string } | null {
  try {
    const saved = sessionStorage.getItem(KEY)
    return saved ? JSON.parse(saved) : null
  } catch { return null }
}
