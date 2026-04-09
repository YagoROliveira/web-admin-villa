import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import villamarketApi from '@/lib/villamarket-api'
import api from '@/lib/api'
import { VM_API } from '@/config/api'
import type { Store, StoreFormValues, StoreStats, Schedule } from '../data/schema'

// ─── Types ───────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ─── Normalizer ──────────────────────────────────────────────────────

const IMG_BASE = (import.meta.env.VITE_API_BASE_URL || 'https://prod.villamarket.app')

function buildImgUrl(filename: string | null | undefined): string | null {
  if (!filename) return null
  if (filename.startsWith('http')) return filename
  return `${IMG_BASE}/storage/app/public/restaurant/${filename}`
}

function normalizeStore(raw: any): Store {
  return {
    id: String(raw.id),
    name: raw.name ?? '',
    slug: raw.slug ?? String(raw.id),
    vendorId: String(raw.vendor_id ?? ''),
    moduleId: String(raw.module_id ?? ''),
    zoneId: String(raw.zone_id ?? ''),
    phone: raw.phone ?? null,
    email: raw.email ?? null,
    address: raw.address ?? null,
    latitude: parseFloat(raw.latitude ?? '0') || 0,
    longitude: parseFloat(raw.longitude ?? '0') || 0,
    logoUrl: buildImgUrl(raw.logo),
    coverUrl: buildImgUrl(raw.cover_photo),
    minOrder: raw.minimum_order != null ? parseFloat(raw.minimum_order) : null,
    commissionRate: raw.comission != null ? parseFloat(raw.comission) : null,
    taxRate: raw.tax != null ? parseFloat(raw.tax) : null,
    isActive: raw.active === 1 || raw.status === 1,
    isApproved: raw.active === 1,
    isFeatured: raw.featured === 1,
    avgRating: raw.rating != null ? parseFloat(raw.rating) : null,
    totalOrders: raw.total_order ?? raw.order_count ?? null,
    createdAt: raw.created_at ?? '',
    updatedAt: raw.updated_at ?? '',
    // Extra fields from detail endpoint
    vendor: raw.vendor ?? null,
    module: raw.module ?? null,
    zone: raw.zone ?? null,
    _count: {
      items: raw.items_count ?? 0,
      orders: raw.total_order ?? raw.order_count ?? 0,
      reviews: raw.reviews_count ?? 0,
    },
  } as Store
}

// ─── Queries ─────────────────────────────────────────────────────────

export function useStores(page = 1, limit = 25, search = '', status = '') {
  return useQuery<PaginatedResponse<Store>>({
    queryKey: ['stores', page, limit, search, status],
    queryFn: async () => {
      const params: Record<string, string> = {
        page: page.toString(),
        limit: limit.toString(),
      }
      if (search) params.search = search
      if (status && status !== 'all') params.status = status
      const { data } = await api.get('/admin/stores', { params })
      const raw = data?.data ?? data?.stores ?? []
      const total = data?.count ?? data?.total ?? raw.length
      const totalPages = Math.max(1, Math.ceil(total / limit))
      return {
        items: raw.map(normalizeStore),
        total,
        page,
        limit,
        totalPages,
      }
    },
    staleTime: 30_000,
  })
}

export function useStore(storeId: string) {
  return useQuery<Store>({
    queryKey: ['store', storeId],
    queryFn: async () => {
      const { data } = await api.get(`/admin/stores/${storeId}`)
      const raw = data?.data ?? data
      return normalizeStore(raw)
    },
    enabled: !!storeId,
  })
}

export function useStoreStats() {
  return useQuery<StoreStats>({
    queryKey: ['stores', 'stats'],
    queryFn: async () => {
      // Derive stats from store list since /stats endpoint doesn't exist
      const { data } = await api.get('/admin/stores', { params: { limit: '200' } })
      const raw: any[] = data?.data ?? []
      const total = data?.count ?? raw.length
      const active = raw.filter((s: any) => s.active === 1 || s.status === 1).length
      const featured = raw.filter((s: any) => s.featured === 1).length
      const pending = raw.filter((s: any) => s.active !== 1 && s.status !== 1).length
      return { total, active, inactive: total - active, pending, featured } as StoreStats
    },
    staleTime: 120_000,
    retry: false,
  })
}

// ─── Mutations ───────────────────────────────────────────────────────

export function useCreateStore() {
  const qc = useQueryClient()
  return useMutation<Store, Error, StoreFormValues>({
    mutationFn: async (dto) => {
      const { data } = await villamarketApi.post(
        VM_API.ENDPOINTS.STORES.CREATE,
        dto,
      )
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stores'] })
      toast.success('Loja criada com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao criar loja')
    },
  })
}

export function useUpdateStore() {
  const qc = useQueryClient()
  return useMutation<Store, Error, { id: string; data: Partial<StoreFormValues> }>({
    mutationFn: async ({ id, data: dto }) => {
      const { data } = await villamarketApi.patch(
        VM_API.ENDPOINTS.STORES.UPDATE(id),
        dto,
      )
      return data
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['stores'] })
      qc.invalidateQueries({ queryKey: ['store', variables.id] })
      toast.success('Loja atualizada com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao atualizar loja')
    },
  })
}

export function useDeleteStore() {
  const qc = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: async (storeId) => {
      await api.delete(`/admin/stores/${storeId}`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stores'] })
      toast.success('Loja removida com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao remover loja')
    },
  })
}

export function useToggleStoreActive() {
  const qc = useQueryClient()
  return useMutation<void, Error, { id: string; value: boolean }>({
    mutationFn: async ({ id, value }) => {
      await api.put(`/admin/stores/${id}`, { status: value ? 1 : 0 })
    },
    onSuccess: (_data, { value }) => {
      qc.invalidateQueries({ queryKey: ['stores'] })
      toast.success(value ? 'Loja ativada com sucesso!' : 'Loja desativada com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao alterar status')
    },
  })
}

export function useToggleStoreApproved() {
  const qc = useQueryClient()
  return useMutation<void, Error, { id: string; value: boolean }>({
    mutationFn: async ({ id, value }) => {
      await api.put(`/admin/stores/${id}`, { active: value ? 1 : 0 })
    },
    onSuccess: (_data, { value }) => {
      qc.invalidateQueries({ queryKey: ['stores'] })
      toast.success(value ? 'Loja aprovada com sucesso!' : 'Loja desaprovada com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao alterar aprovação')
    },
  })
}

export function useToggleStoreFeatured() {
  const qc = useQueryClient()
  return useMutation<void, Error, { id: string; value: boolean }>({
    mutationFn: async ({ id, value }) => {
      await api.put(`/admin/stores/${id}`, { featured: value ? 1 : 0 })
    },
    onSuccess: (_data, { value }) => {
      qc.invalidateQueries({ queryKey: ['stores'] })
      toast.success(value ? 'Loja destacada com sucesso!' : 'Loja removida dos destaques!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao alterar destaque')
    },
  })
}

// ─── Schedules ───────────────────────────────────────────────────────

export function useStoreSchedules(storeId: string) {
  return useQuery<Schedule[]>({
    queryKey: ['store-schedules', storeId],
    queryFn: async () => {
      const { data } = await villamarketApi.get(VM_API.ENDPOINTS.STORES.SCHEDULES(storeId))
      return Array.isArray(data) ? data : data?.schedules ?? data?.data ?? []
    },
    enabled: !!storeId,
    staleTime: 60_000,
  })
}

export function useAddStoreSchedule(storeId: string) {
  const qc = useQueryClient()
  return useMutation<void, Error, { day: number; opening_time: string; closing_time: string }>({
    mutationFn: async (payload) => {
      await villamarketApi.post(VM_API.ENDPOINTS.STORES.SCHEDULES(storeId), {
        storeId,
        day: payload.day,
        openTime: payload.opening_time,
        closeTime: payload.closing_time,
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['store-schedules', storeId] })
      toast.success('Horário adicionado!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao adicionar horário')
    },
  })
}

export function useDeleteStoreSchedule(storeId: string) {
  const qc = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: async (scheduleId) => {
      await villamarketApi.delete(`${VM_API.ENDPOINTS.STORES.SCHEDULES(storeId)}/${scheduleId}`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['store-schedules', storeId] })
      toast.success('Horário removido!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao remover horário')
    },
  })
}

// ─── Discount ────────────────────────────────────────────────────────

export function useUpdateStoreDiscount(storeId: string) {
  const qc = useQueryClient()
  return useMutation<void, Error, {
    discount: number
    discount_type: 'percent' | 'amount'
    min_purchase?: number
    max_discount?: number
    start_date: string
    end_date: string
    start_time?: string
    end_time?: string
  }>({
    mutationFn: async (payload) => {
      // Try NestJS first, fallback to phpApi-style endpoint
      try {
        await villamarketApi.patch(`/v1/stores/${storeId}/discount`, payload)
      } catch {
        await villamarketApi.post(`/v1/stores/${storeId}/discount`, payload)
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['store', storeId] })
      qc.invalidateQueries({ queryKey: ['stores'] })
      toast.success('Desconto atualizado!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao salvar desconto')
    },
  })
}

// ─── Store Orders ────────────────────────────────────────────────────

export function useStoreOrders(storeId: string, page = 1, limit = 20) {
  const offset = (page - 1) * limit
  return useQuery<{ orders: any[]; total: number }>({
    queryKey: ['store-orders', storeId, page],
    queryFn: async () => {
      const { data } = await api.get('/admin/stores/orders-with-costs', {
        params: { store_id: storeId, limit: String(limit), offset: String(offset) },
      })
      return {
        orders: data?.orders ?? [],
        total: Number(data?.total_orders ?? 0),
      }
    },
    enabled: !!storeId,
    staleTime: 30_000,
  })
}

// ─── Withdraws ───────────────────────────────────────────────────────

export function useStoreWithdraws(storeId: string, status?: string) {
  return useQuery<any>({
    queryKey: ['store-withdraws', storeId, status],
    queryFn: async () => {
      const params: Record<string, string> = { store_id: storeId }
      if (status) params.status = status
      try {
        const { data } = await villamarketApi.get('/v1/stores/withdrawals', { params })
        return data
      } catch {
        // fallback endpoint variant
        const { data } = await villamarketApi.get(`/v1/stores/${storeId}/withdrawals`)
        return data
      }
    },
    enabled: !!storeId,
    staleTime: 30_000,
    retry: false,
  })
}

export function useUpdateWithdrawStatus() {
  const qc = useQueryClient()
  return useMutation<void, Error, { id: string | number; status: 'approved' | 'denied'; transaction_note?: string }>({
    mutationFn: async ({ id, status, transaction_note }) => {
      await villamarketApi.patch(`/v1/stores/withdrawals/${id}`, { status, transaction_note })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['store-withdraws'] })
      toast.success('Status do saque atualizado!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao atualizar saque')
    },
  })
}
