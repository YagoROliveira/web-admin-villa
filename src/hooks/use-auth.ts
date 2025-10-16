import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { buildApiUrl, getAuthHeaders, API_CONFIG } from '@/config/api'

// Tipos para autenticação
interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  user: {
    id: number
    firstName: string
    lastName: string
    email: string
    role: 'ADMIN' | 'USER'
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION'
  }
  accessToken: string
  refreshToken: string
}

interface UserResponse {
  id: number
  firstName: string
  lastName: string
  email: string
  role: 'ADMIN' | 'USER'
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION'
  phone?: string
  document?: string
  createdAt: string
  updatedAt: string
}

// Hook para login
export function useLogin() {
  const { auth } = useAuthStore()

  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: async (credentials: LoginRequest) => {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGIN)
      console.log('🔐 Login Request:', {
        url,
        credentials: { ...credentials, password: '***' },
      })

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      console.log('📡 Login Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      })

      if (!response.ok) {
        let errorMessage = `Erro ${response.status}: ${response.statusText}`
        try {
          const errorData = await response.json()
          console.error('❌ Error Data:', errorData)
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch {
          const errorText = await response.text()
          console.error('❌ Error Text:', errorText)
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log('✅ Login Success:', {
        user: data.user,
        hasAccessToken: !!data.accessToken,
        hasRefreshToken: !!data.refreshToken,
      })

      return data
    },
    onSuccess: (data: LoginResponse) => {
      // Adaptar os dados do usuário para o formato esperado pelo store
      const user = {
        id: data.user.id.toString(),
        email: data.user.email,
        name: `${data.user.firstName} ${data.user.lastName}`,
        role: data.user.role,
        accountNo: `ACC${data.user.id}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      auth.setUser(user)
      auth.setAccessToken(data.accessToken)
      auth.setRefreshToken(data.refreshToken)

      toast.success(`Bem-vindo, ${data.user.firstName}!`)
    },
    onError: (error: Error) => {
      console.error('Erro no login:', error)
      toast.error(error.message || 'Erro ao fazer login')
    },
  })
}

// Hook para logout
export function useLogout() {
  const { auth } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      const token = auth.accessToken

      if (token) {
        const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGOUT), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          // Mesmo se der erro, vamos fazer logout local
          console.warn('Erro no logout do servidor, fazendo logout local')
        }
      }
    },
    onSettled: () => {
      // Limpar dados locais independente do resultado
      auth.reset()
      queryClient.clear()
      toast.success('Logout realizado com sucesso')
    },
  })
}

// Hook para obter informações do usuário atual
export function useCurrentUser() {
  const { auth } = useAuthStore()

  return useQuery<UserResponse>({
    queryKey: ['current-user'],
    queryFn: async () => {
      const token = auth.accessToken

      if (!token) {
        throw new Error('Token não encontrado')
      }

      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.ME), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      return response.json()
    },
    enabled: !!auth.accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: (failureCount: number, error: any) => {
      // Não tentar novamente se for erro 401 (não autorizado)
      if (error?.message?.includes('401')) {
        auth.reset()
        return false
      }
      return failureCount < 3
    },
  })
}

// Hook para validar token
export function useValidateToken() {
  const { auth } = useAuthStore()

  return useQuery<{ valid: boolean }>({
    queryKey: ['validate-token'],
    queryFn: async () => {
      const token = auth.accessToken

      if (!token) {
        throw new Error('Token não encontrado')
      }

      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.VALIDATE), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Token inválido`)
      }

      return response.json()
    },
    enabled: !!auth.accessToken,
    staleTime: 1 * 60 * 1000, // 1 minuto
    retry: false,
  })
}

// Hook para refresh token
export function useRefreshToken() {
  const { auth } = useAuthStore()

  return useMutation<LoginResponse, Error, void>({
    mutationFn: async () => {
      const refreshToken = auth.refreshToken

      if (!refreshToken) {
        throw new Error('Refresh token não encontrado')
      }

      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.REFRESH), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      })

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      return response.json()
    },
    onSuccess: (data: LoginResponse) => {
      auth.setAccessToken(data.accessToken)
      auth.setRefreshToken(data.refreshToken)
    },
    onError: () => {
      // Se o refresh falhar, fazer logout
      auth.reset()
    },
  })
}