import { useEffect, useState } from 'react'
import type { ApiError } from '@/types'

interface State<T> { data?: T; error?: ApiError; loading: boolean }

/** Runs an async service call and tracks loading/error state. Re-runs when `deps` change or on refetch(). */
export function useQuery<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<State<T>>({ loading: true })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState((s) => ({ ...s, loading: true, error: undefined }))
    fetcher()
      .then((data) => { if (!cancelled) setState({ data, loading: false }) })
      .catch((error: ApiError) => { if (!cancelled) setState({ error, loading: false }) })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...deps])

  return { ...state, refetch: () => setTick((t) => t + 1) }
}
