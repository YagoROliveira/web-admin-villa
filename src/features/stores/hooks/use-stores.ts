import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import villamarketApi from '@/lib/villamarket-api'
import { VM_API } from '@/config/api'
import type { Store, StoreFormValues, StoreStats } from '../data/schema'

// ─── Types ───────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ─── Queries ─────────────────────────────────────────────────────────

export function useStores(page = 1, limit = 25, search = '') {
  return useQuery<PaginatedResponse<Store>>({
    queryKey: ['stores', page, limit, search],
    queryFn: async () => {
      const params: Record<string, string> = {
        page: page.toString(),
        limit: limit.toString(),
      }
      if (search) params.search = search
      const { data } = await villamarketApi.get(
        VM_API.ENDPOINTS.STORES.LIST,
        { params },
      )
      return data
    },
    staleTime: 30_000,
  })
}

export function useStore(storeId: string) {
  return useQuery<Store>({
    queryKey: ['store', storeId],
    queryFn: async () => {
      const { data } = await villamarketApi.get(
        VM_API.ENDPOINTS.STORES.GET(storeId),
      )
      return data
    },
    enabled: !!storeId,
  })
}

export function useStoreStats() {
  return useQuery<StoreStats>({
    queryKey: ['stores', 'stats'],
    queryFn: async () => {
      const { data } = await villamarketApi.get(VM_API.ENDPOINTS.STORES.STATS)
      return data
    },
    staleTime: 60_000,
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
      await villamarketApi.delete(VM_API.ENDPOINTS.STORES.DELETE(storeId))
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
  return useMutation<Store, Error, string>({
    mutationFn: async (storeId) => {
      const { data } = await villamarketApi.patch(
        VM_API.ENDPOINTS.STORES.TOGGLE_ACTIVE(storeId),
      )
      return data
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['stores'] })
      qc.invalidateQueries({ queryKey: ['store', data.id] })
      toast.success(
        `Loja ${data.isActive ? 'ativada' : 'desativada'} com sucesso!`,
      )
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao alterar status')
    },
  })
}

export function useToggleStoreApproved() {
  const qc = useQueryClient()
  return useMutation<Store, Error, string>({
    mutationFn: async (storeId) => {
      const { data } = await villamarketApi.patch(
        VM_API.ENDPOINTS.STORES.TOGGLE_APPROVED(storeId),
      )
      return data
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['stores'] })
      qc.invalidateQueries({ queryKey: ['store', data.id] })
      toast.success(
        `Loja ${data.isApproved ? 'aprovada' : 'desaprovada'} com sucesso!`,
      )
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao alterar aprovação')
    },
  })
}

export function useToggleStoreFeatured() {
  const qc = useQueryClient()
  return useMutation<Store, Error, string>({
    mutationFn: async (storeId) => {
      const { data } = await villamarketApi.patch(
        VM_API.ENDPOINTS.STORES.TOGGLE_FEATURED(storeId),
      )
      return data
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['stores'] })
      qc.invalidateQueries({ queryKey: ['store', data.id] })
      toast.success(
        `Loja ${data.isFeatured ? 'destacada' : 'removida dos destaques'} com sucesso!`,
      )
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao alterar destaque')
    },
  })
}
