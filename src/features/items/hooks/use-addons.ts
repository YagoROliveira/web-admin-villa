import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import villamarketApi from '@/lib/villamarket-api'
import { VM_API } from '@/config/api'

// ─── Types ───────────────────────────────────────────────────────────

export interface Addon {
  id: string
  storeId: string
  name: string
  price: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface PaginatedAddons {
  items: Addon[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ─── Queries ─────────────────────────────────────────────────────────

export function useAddons(storeId?: string, page = 1, limit = 100) {
  return useQuery<PaginatedAddons>({
    queryKey: ['addons', storeId, page, limit],
    queryFn: async () => {
      const params: Record<string, string> = {
        page: page.toString(),
        limit: limit.toString(),
      }
      if (storeId) params.storeId = storeId
      const { data } = await villamarketApi.get(
        VM_API.ENDPOINTS.ADDONS.LIST,
        { params },
      )
      return data
    },
    staleTime: 30_000,
  })
}

// ─── Mutations ───────────────────────────────────────────────────────

export function useCreateAddon() {
  const qc = useQueryClient()
  return useMutation<Addon, Error, { storeId: string; name: string; price: number }>({
    mutationFn: async (dto) => {
      const { data } = await villamarketApi.post(
        VM_API.ENDPOINTS.ADDONS.CREATE,
        dto,
      )
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addons'] })
      toast.success('Complemento criado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao criar complemento')
    },
  })
}

export function useUpdateAddon() {
  const qc = useQueryClient()
  return useMutation<Addon, Error, { id: string; data: Partial<{ name: string; price: number; isActive: boolean }> }>({
    mutationFn: async ({ id, data: dto }) => {
      const { data } = await villamarketApi.patch(
        VM_API.ENDPOINTS.ADDONS.UPDATE(id),
        dto,
      )
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addons'] })
      toast.success('Complemento atualizado!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao atualizar complemento')
    },
  })
}

export function useDeleteAddon() {
  const qc = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await villamarketApi.delete(VM_API.ENDPOINTS.ADDONS.DELETE(id))
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addons'] })
      toast.success('Complemento removido!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao remover complemento')
    },
  })
}
