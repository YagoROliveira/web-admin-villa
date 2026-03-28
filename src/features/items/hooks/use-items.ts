import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import villamarketApi from '@/lib/villamarket-api'
import { VM_API } from '@/config/api'
import type { Item, ItemFormValues } from '../data/schema'

// ─── Types ───────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ─── Queries ─────────────────────────────────────────────────────────

export function useItems(page = 1, limit = 25, search = '') {
  return useQuery<PaginatedResponse<Item>>({
    queryKey: ['items', page, limit, search],
    queryFn: async () => {
      const params: Record<string, string> = {
        page: page.toString(),
        limit: limit.toString(),
      }
      if (search) params.search = search
      const { data } = await villamarketApi.get(
        VM_API.ENDPOINTS.ITEMS.LIST,
        { params },
      )
      return data
    },
    staleTime: 30_000,
  })
}

export function useItem(itemId: string) {
  return useQuery<Item>({
    queryKey: ['item', itemId],
    queryFn: async () => {
      const { data } = await villamarketApi.get(
        VM_API.ENDPOINTS.ITEMS.GET(itemId),
      )
      return data
    },
    enabled: !!itemId,
  })
}

// ─── Mutations ───────────────────────────────────────────────────────

export function useCreateItem() {
  const qc = useQueryClient()
  return useMutation<Item, Error, ItemFormValues>({
    mutationFn: async (dto) => {
      const { data } = await villamarketApi.post(
        VM_API.ENDPOINTS.ITEMS.CREATE,
        dto,
      )
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['items'] })
      toast.success('Produto criado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao criar produto')
    },
  })
}

export function useUpdateItem() {
  const qc = useQueryClient()
  return useMutation<Item, Error, { id: string; data: Partial<ItemFormValues> }>({
    mutationFn: async ({ id, data: dto }) => {
      const { data } = await villamarketApi.patch(
        VM_API.ENDPOINTS.ITEMS.UPDATE(id),
        dto,
      )
      return data
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['items'] })
      qc.invalidateQueries({ queryKey: ['item', variables.id] })
      toast.success('Produto atualizado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao atualizar produto')
    },
  })
}

export function useDeleteItem() {
  const qc = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: async (itemId) => {
      await villamarketApi.delete(VM_API.ENDPOINTS.ITEMS.DELETE(itemId))
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['items'] })
      toast.success('Produto removido com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao remover produto')
    },
  })
}

export function useToggleItemActive() {
  const qc = useQueryClient()
  return useMutation<Item, Error, string>({
    mutationFn: async (itemId) => {
      const { data } = await villamarketApi.patch(
        VM_API.ENDPOINTS.ITEMS.TOGGLE_ACTIVE(itemId),
      )
      return data
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['items'] })
      qc.invalidateQueries({ queryKey: ['item', data.id] })
      toast.success(
        `Produto ${data.isActive ? 'ativado' : 'desativado'} com sucesso!`,
      )
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao alterar status')
    },
  })
}

export function useApproveItem() {
  const qc = useQueryClient()
  return useMutation<Item, Error, string>({
    mutationFn: async (itemId) => {
      const { data } = await villamarketApi.patch(
        VM_API.ENDPOINTS.ITEMS.APPROVE(itemId),
      )
      return data
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['items'] })
      qc.invalidateQueries({ queryKey: ['item', data.id] })
      toast.success('Produto aprovado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao aprovar produto')
    },
  })
}

// ─── Item Stats ──────────────────────────────────────────────────────

export interface ItemStats {
  orderCount: number
  reviewCount: number
  wishlistCount: number
  avgRating: number
  totalRevenue: number
  totalUnitsSold: number
}

export function useItemStats(itemId: string) {
  return useQuery<ItemStats>({
    queryKey: ['item', itemId, 'stats'],
    queryFn: async () => {
      const { data } = await villamarketApi.get(
        VM_API.ENDPOINTS.ITEMS.STATS(itemId),
      )
      return data
    },
    enabled: !!itemId,
  })
}

// ─── Item Addons ─────────────────────────────────────────────────────

export function useSetItemAddons() {
  const qc = useQueryClient()
  return useMutation<Item, Error, { itemId: string; addonIds: string[] }>({
    mutationFn: async ({ itemId, addonIds }) => {
      const { data } = await villamarketApi.patch(
        VM_API.ENDPOINTS.ITEMS.SET_ADDONS(itemId),
        { addonIds },
      )
      return data
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['item', vars.itemId] })
      toast.success('Complementos atualizados!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao atualizar complementos')
    },
  })
}

export function useAttachItemAddon() {
  const qc = useQueryClient()
  return useMutation<Item, Error, { itemId: string; addonId: string }>({
    mutationFn: async ({ itemId, addonId }) => {
      const { data } = await villamarketApi.post(
        VM_API.ENDPOINTS.ITEMS.ATTACH_ADDON(itemId, addonId),
      )
      return data
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['item', vars.itemId] })
      toast.success('Complemento adicionado!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao adicionar complemento')
    },
  })
}

export function useDetachItemAddon() {
  const qc = useQueryClient()
  return useMutation<void, Error, { itemId: string; addonId: string }>({
    mutationFn: async ({ itemId, addonId }) => {
      await villamarketApi.delete(
        VM_API.ENDPOINTS.ITEMS.DETACH_ADDON(itemId, addonId),
      )
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['item', vars.itemId] })
      toast.success('Complemento removido!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao remover complemento')
    },
  })
}

// ─── Item Variations ─────────────────────────────────────────────────

export function useUpdateItemVariations() {
  const qc = useQueryClient()
  return useMutation<Item, Error, { itemId: string; variations: any }>({
    mutationFn: async ({ itemId, variations }) => {
      const { data } = await villamarketApi.patch(
        VM_API.ENDPOINTS.ITEMS.UPDATE_VARIATIONS(itemId),
        { variations },
      )
      return data
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['item', vars.itemId] })
      toast.success('Variações atualizadas!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao atualizar variações')
    },
  })
}
