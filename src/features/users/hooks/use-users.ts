import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import villamarketApi from '@/lib/villamarket-api'
import { VM_API } from '@/config/api'

// ─── Tipos (NestJS /v1/users) ───

export interface User {
  id: string
  name: string
  email: string | null
  phone: string | null
  avatarUrl: string | null
  role: string
  isActive: boolean
  isEmailVerified: boolean
  isPhoneVerified: boolean
  walletBalance: number
  loyaltyPoints: number
  referralCode: string | null
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
  _count: {
    orders: number
    addresses: number
  }
}

export interface CreateUserRequest {
  name: string
  email: string
  phone?: string
  password: string
}

export interface UpdateUserRequest {
  name?: string
  email?: string
  phone?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ─── Hook: listar clientes ───

export function useUsers(page = 1, limit = 25, search = '') {
  return useQuery<PaginatedResponse<User>>({
    queryKey: ['users', page, limit, search],
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

export function useUser(userId: string) {
  return useQuery<User>({
    queryKey: ['user', userId],
    queryFn: async () => {
      const { data } = await villamarketApi.get(VM_API.ENDPOINTS.USERS.GET(userId))
      return data
    },
    enabled: !!userId,
  })
}

// ─── Hook: atualizar cliente ───

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation<User, Error, { id: string; data: UpdateUserRequest }>({
    mutationFn: async ({ id, data: dto }) => {
      const { data } = await villamarketApi.patch(VM_API.ENDPOINTS.USERS.UPDATE(id), dto)
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] })
      toast.success('Cliente atualizado com sucesso!')
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao atualizar cliente')
    },
  })
}

// ─── Hook: deletar cliente ───

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: async (userId) => {
      await villamarketApi.delete(VM_API.ENDPOINTS.USERS.DELETE(userId))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Cliente removido com sucesso!')
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao remover cliente')
    },
  })
}

// ─── Hook: ativar/desativar cliente ───

export function useToggleUserStatus() {
  const queryClient = useQueryClient()

  return useMutation<User, Error, { id: string }>({
    mutationFn: async ({ id }) => {
      const { data } = await villamarketApi.patch(VM_API.ENDPOINTS.USERS.TOGGLE_ACTIVE(id))
      return data
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] })
      const statusText = data.isActive ? 'ativado' : 'desativado'
      toast.success(`Cliente ${statusText} com sucesso!`)
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao alterar status do cliente')
    },
  })
}
