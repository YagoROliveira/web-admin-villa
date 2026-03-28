import {
  useQuery,
  useMutation,
  type UseQueryOptions,
} from '@tanstack/react-query'
import villamarketApi from '@/lib/villamarket-api'
import type {
  TrackEventRequest,
  StoreDashboardResponse,
  DailyMetric,
  StoreMetricsParams,
} from '../types'

// ─── Query Keys ───

export const analyticsKeys = {
  all: ['analytics'] as const,
  storeDashboard: (storeId: string) =>
    [...analyticsKeys.all, 'dashboard', storeId] as const,
  storeMetrics: (storeId: string, params?: StoreMetricsParams) =>
    [...analyticsKeys.all, 'metrics', storeId, params] as const,
}

// ─── Queries ───

/** Get store dashboard analytics */
export function useStoreDashboard(
  storeId: string,
  options?: Partial<UseQueryOptions<StoreDashboardResponse>>,
) {
  return useQuery<StoreDashboardResponse>({
    queryKey: analyticsKeys.storeDashboard(storeId),
    queryFn: async () => {
      const { data } = await villamarketApi.get(
        `/v1/analytics/store/${storeId}/dashboard`,
      )
      return data
    },
    enabled: !!storeId,
    staleTime: 5 * 60_000, // 5 min
    ...options,
  })
}

/** Get store daily metrics with date range */
export function useStoreMetrics(
  storeId: string,
  params?: StoreMetricsParams,
  options?: Partial<UseQueryOptions<DailyMetric[]>>,
) {
  return useQuery<DailyMetric[]>({
    queryKey: analyticsKeys.storeMetrics(storeId, params),
    queryFn: async () => {
      const { data } = await villamarketApi.get(
        `/v1/analytics/store/${storeId}/metrics`,
        { params },
      )
      return data
    },
    enabled: !!storeId,
    staleTime: 5 * 60_000,
    ...options,
  })
}

// ─── Mutations ───

/** Track a single analytics event */
export function useTrackEvent() {
  return useMutation({
    mutationFn: async (req: TrackEventRequest) => {
      const { data } = await villamarketApi.post('/v1/analytics/track', req)
      return data
    },
  })
}

/** Track multiple events in bulk */
export function useTrackBulkEvents() {
  return useMutation({
    mutationFn: async (events: TrackEventRequest[]) => {
      const { data } = await villamarketApi.post('/v1/analytics/track/bulk', {
        events,
      })
      return data
    },
  })
}
