import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { buildApiUrl, getAuthHeaders, API_CONFIG } from '@/config/api'
import { mockUsers } from '../data/mock-data'

// Tipos para usuários
export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  role: 'ADMIN' | 'USER' | 'MANAGER' | 'CASHIER'
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION'
  balance?: number
  accountNo?: string
  createdAt: string
  updatedAt: string
}

export interface CreateUserRequest {
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  role: 'ADMIN' | 'USER' | 'MANAGER' | 'CASHIER'
  password: string
}

export interface UpdateUserRequest {
  firstName?: string
  lastName?: string
  email?: string
  phoneNumber?: string
  role?: 'ADMIN' | 'USER' | 'MANAGER' | 'CASHIER'
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION'
}

export interface UsersListResponse {
  users: User[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

// Hook para listar usuários
export function useUsers(page = 1, pageSize = 10, search = '') {
  const { auth } = useAuthStore()

  console.log('useUsers - auth state:', {
    hasToken: !!auth.accessToken,
    user: auth.user,
    page,
    pageSize,
    search
  })

  return useQuery<UsersListResponse>({
    queryKey: ['users', page, pageSize, search, auth.accessToken],
    queryFn: async () => {
      // Se não estiver autenticado, usar dados mock
      if (!auth.isAuthenticated()) {
        console.log('Não autenticado, usando dados mock')
        return mockUsers
      }

      const params: Record<string, string> = {
        page: page.toString(),
        pageSize: pageSize.toString()
      }
      if (search) {
        params.search = search
      }

      const url = buildApiUrl(API_CONFIG.ENDPOINTS.USERS.LIST, params)
      const headers = getAuthHeaders(auth.accessToken)

      console.log('Fazendo fetch para:', url)
      console.log('Headers:', headers)

      try {
        const response = await fetch(url, {
          headers,
          mode: 'cors', // Especificar modo CORS
        })

        console.log('Response status:', response.status)
        console.log('Response ok:', response.ok)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Erro da API:', errorText)
          throw new Error(`Erro ${response.status}: ${errorText}`)
        }

        const data = await response.json()
        console.log('Dados recebidos:', data)
        return data
      } catch (fetchError: any) {
        console.error('Erro no fetch:', fetchError)

        // Se o erro é de network, usar dados mockados
        if (fetchError.message === 'Failed to fetch' || fetchError.name === 'TypeError') {
          console.warn('Servidor não disponível, usando dados mockados')
          toast.warning('Usando dados de exemplo - servidor não conectado')
          return mockUsers
        }

        throw fetchError
      }
    },
    enabled: true, // Sempre habilitado, mas usa lógica interna para decidir entre API ou mock
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: (failureCount: number, error: any) => {
      console.log('Tentativa de retry:', failureCount, error)
      // Não fazer retry se for erro de conexão
      if (error?.message?.includes('conectar ao servidor')) {
        return false
      }
      return failureCount < 3
    },
  })
}

// Hook para obter um usuário específico
export function useUser(userId: string) {
  const { auth } = useAuthStore()

  return useQuery<User>({
    queryKey: ['user', userId, auth.accessToken],
    queryFn: async () => {
      const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.USERS.GET}/${userId}`), {
        headers: getAuthHeaders(auth.accessToken),
      })

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      return response.json()
    },
    enabled: !!auth.accessToken && !!userId,
  })
}

// Hook para criar usuário
export function useCreateUser() {
  const { auth } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation<User, Error, CreateUserRequest>({
    mutationFn: async (userData: CreateUserRequest) => {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.USERS.CREATE), {
        method: 'POST',
        headers: getAuthHeaders(auth.accessToken),
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erro ${response.status}: ${errorText}`)
      }

      return response.json()
    },
    onSuccess: (data: User) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success(`Usuário ${data.firstName} ${data.lastName} criado com sucesso!`)
    },
    onError: (error: Error) => {
      console.error('Erro ao criar usuário:', error)
      toast.error(error.message || 'Erro ao criar usuário')
    },
  })
}

// Hook para atualizar usuário
export function useUpdateUser() {
  const { auth } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation<User, Error, { id: string; data: UpdateUserRequest }>({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserRequest }) => {
      const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.USERS.UPDATE}/${id}`), {
        method: 'PUT',
        headers: getAuthHeaders(auth.accessToken),
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erro ${response.status}: ${errorText}`)
      }

      return response.json()
    },
    onSuccess: (data: User, variables: { id: string; data: UpdateUserRequest }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] })
      toast.success(`Usuário ${data.firstName} ${data.lastName} atualizado com sucesso!`)
    },
    onError: (error: Error) => {
      console.error('Erro ao atualizar usuário:', error)
      toast.error(error.message || 'Erro ao atualizar usuário')
    },
  })
}

// Hook para deletar usuário
export function useDeleteUser() {
  const { auth } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: async (userId: string) => {
      const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.USERS.DELETE}/${userId}`), {
        method: 'DELETE',
        headers: getAuthHeaders(auth.accessToken),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erro ${response.status}: ${errorText}`)
      }

      // Se não retorna JSON, não precisa fazer parse
      if (response.status !== 204) {
        return response.json()
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Usuário deletado com sucesso!')
    },
    onError: (error: Error) => {
      console.error('Erro ao deletar usuário:', error)
      toast.error(error.message || 'Erro ao deletar usuário')
    },
  })
}

// Hook para alternar status do usuário
export function useToggleUserStatus() {
  const { auth } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation<User, Error, { id: string; status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' }>({
    mutationFn: async ({ id, status }: { id: string; status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' }) => {
      const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.USERS.UPDATE}/${id}/status`), {
        method: 'PATCH',
        headers: getAuthHeaders(auth.accessToken),
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erro ${response.status}: ${errorText}`)
      }

      return response.json()
    },
    onSuccess: (data: User, variables: { id: string; status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] })
      const statusText = variables.status === 'ACTIVE' ? 'ativado' :
        variables.status === 'INACTIVE' ? 'desativado' : 'suspenso'
      toast.success(`Usuário ${data.firstName} ${data.lastName} ${statusText} com sucesso!`)
    },
    onError: (error: Error) => {
      console.error('Erro ao alterar status do usuário:', error)
      toast.error(error.message || 'Erro ao alterar status do usuário')
    },
  })
}