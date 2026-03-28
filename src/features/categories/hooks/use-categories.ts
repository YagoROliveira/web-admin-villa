import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import villamarketApi from '@/lib/villamarket-api'
import { VM_API } from '@/config/api'
import type { Category, CategoryFormValues } from '../data/schema'

// ─── Types ───────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ─── Queries ─────────────────────────────────────────────────────────

export function useCategories(page = 1, limit = 25, search = '') {
  return useQuery<PaginatedResponse<Category>>({
    queryKey: ['categories', page, limit, search],
    queryFn: async () => {
      const params: Record<string, string> = {
        page: page.toString(),
        limit: limit.toString(),
      }
      if (search) params.search = search
      const { data } = await villamarketApi.get(
        VM_API.ENDPOINTS.CATEGORIES.LIST,
        { params },
      )
      return data
    },
    staleTime: 30_000,
  })
}

export function useCategory(categoryId: string) {
  return useQuery<Category>({
    queryKey: ['category', categoryId],
    queryFn: async () => {
      const { data } = await villamarketApi.get(
        VM_API.ENDPOINTS.CATEGORIES.GET(categoryId),
      )
      return data
    },
    enabled: !!categoryId,
  })
}

// ─── Mutations ───────────────────────────────────────────────────────

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation<Category, Error, CategoryFormValues>({
    mutationFn: async (dto) => {
      const { data } = await villamarketApi.post(
        VM_API.ENDPOINTS.CATEGORIES.CREATE,
        dto,
      )
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Categoria criada com sucesso!')
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Erro ao criar categoria',
      )
    },
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation<
    Category,
    Error,
    { id: string; data: Partial<CategoryFormValues> }
  >({
    mutationFn: async ({ id, data: dto }) => {
      const { data } = await villamarketApi.patch(
        VM_API.ENDPOINTS.CATEGORIES.UPDATE(id),
        dto,
      )
      return data
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      qc.invalidateQueries({ queryKey: ['category', variables.id] })
      toast.success('Categoria atualizada com sucesso!')
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Erro ao atualizar categoria',
      )
    },
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: async (categoryId) => {
      await villamarketApi.delete(
        VM_API.ENDPOINTS.CATEGORIES.DELETE(categoryId),
      )
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Categoria removida com sucesso!')
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Erro ao remover categoria',
      )
    },
  })
}
