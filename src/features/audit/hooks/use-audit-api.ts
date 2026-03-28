import {
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query'
import villamarketApi from '@/lib/villamarket-api'
import type {
  AuditLog,
  AuditQueryParams,
  PaginatedAuditResponse,
} from '../types'

// ─── Query Keys ───

export const auditKeys = {
  all: ['audit'] as const,
  list: (params?: AuditQueryParams) =>
    [...auditKeys.all, 'list', params] as const,
  detail: (id: string) => [...auditKeys.all, 'detail', id] as const,
  entityTimeline: (entityType: string, entityId: string) =>
    [...auditKeys.all, 'entity', entityType, entityId] as const,
}

// ─── Queries ───

/** List audit logs with filters (admin only) */
export function useAuditLogs(
  params?: AuditQueryParams,
  options?: Partial<UseQueryOptions<PaginatedAuditResponse>>,
) {
  return useQuery<PaginatedAuditResponse>({
    queryKey: auditKeys.list(params),
    queryFn: async () => {
      const { data } = await villamarketApi.get('/v1/audit', { params })
      return data
    },
    staleTime: 60_000,
    ...options,
  })
}

/** Get single audit log detail */
export function useAuditLog(
  id: string,
  options?: Partial<UseQueryOptions<AuditLog>>,
) {
  return useQuery<AuditLog>({
    queryKey: auditKeys.detail(id),
    queryFn: async () => {
      const { data } = await villamarketApi.get(`/v1/audit/${id}`)
      return data
    },
    enabled: !!id,
    ...options,
  })
}

/** Get audit timeline for a specific entity */
export function useEntityAuditTimeline(
  entityType: string,
  entityId: string,
  options?: Partial<UseQueryOptions<AuditLog[]>>,
) {
  return useQuery<AuditLog[]>({
    queryKey: auditKeys.entityTimeline(entityType, entityId),
    queryFn: async () => {
      const { data } = await villamarketApi.get(
        `/v1/audit/entity/${entityType}/${entityId}`,
      )
      return data
    },
    enabled: !!entityType && !!entityId,
    ...options,
  })
}
