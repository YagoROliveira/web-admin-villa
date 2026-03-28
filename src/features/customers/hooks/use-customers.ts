import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import villamarketApi from '@/lib/villamarket-api'
import { VM_API } from '@/config/api'
import type { Customer } from '../data/schema'

// ─── Types ───

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface UpdateCustomerRequest {
  name?: string
  email?: string
  phone?: string
}

// ─── Hook: listar clientes do app ───

export function useCustomersList(page = 1, limit = 25, search = '') {
  return useQuery<PaginatedResponse<Customer>>({
    queryKey: ['customers', page, limit, search],
    queryFn: async () => {
      const params: Record<string, string> = {
        page: page.toString(),
        limit: limit.toString(),
      }
      if (search) params.search = search

      const { data } = await villamarketApi.get(VM_API.ENDPOINTS.USERS.LIST, { params })
      return data
    },
    staleTime: 30_000,
  })
}

// ─── Hook: obter um cliente ───

export function useCustomer(customerId: string) {
  return useQuery<Customer>({
    queryKey: ['customer', customerId],
    queryFn: async () => {
      const { data } = await villamarketApi.get(VM_API.ENDPOINTS.USERS.GET(customerId))
      return data
    },
    enabled: !!customerId,
  })
}

// ─── Hook: atualizar cliente ───

export function useUpdateCustomer() {
  const queryClient = useQueryClient()

  return useMutation<Customer, Error, { id: string; data: UpdateCustomerRequest }>({
    mutationFn: async ({ id, data: dto }) => {
      const { data } = await villamarketApi.patch(VM_API.ENDPOINTS.USERS.UPDATE(id), dto)
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['customer', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['user-detail', variables.id] })
      toast.success('Cliente atualizado com sucesso!')
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao atualizar cliente')
    },
  })
}

// ─── Hook: deletar cliente ───

export function useDeleteCustomer() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: async (customerId) => {
      await villamarketApi.delete(VM_API.ENDPOINTS.USERS.DELETE(customerId))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Cliente removido com sucesso!')
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao remover cliente')
    },
  })
}

// ─── Hook: ativar/desativar cliente ───

export function useToggleCustomerStatus() {
  const queryClient = useQueryClient()

  return useMutation<Customer, Error, { id: string }>({
    mutationFn: async ({ id }) => {
      const { data } = await villamarketApi.patch(VM_API.ENDPOINTS.USERS.TOGGLE_ACTIVE(id))
      return data
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['customer', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['user-detail', variables.id] })
      const statusText = data.isActive ? 'ativado' : 'desativado'
      toast.success(`Cliente ${statusText} com sucesso!`)
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao alterar status do cliente')
    },
  })
}
