import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { buildVmApiUrl, VM_API, buildApiUrl, API_CONFIG } from '@/config/api'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { DEFAULT_ROLE_PERMISSIONS } from '@/types/auth'
import { tryPhpLogin } from '@/lib/api'
import type { AuthUser, UserRole, Permission } from '@/types/auth'

// ─── Request / Response types ───

interface LoginRequest {
  email: string
  password: string
}

interface NestAdminLoginResponse {
  admin: {
    id: string
    name: string
    email: string
    role?: string
    permissions?: string[]
  }
  accessToken: string
  refreshToken: string
}

interface NestVendorLoginResponse {
  vendor: {
    id: string
    name: string
    email: string
    store?: {
      id: string
      name: string
      subscription?: string
    } | null
  }
  accessToken: string
  refreshToken: string
}

/** Profile returned by GET /v1/auth/me */
interface MeResponse {
  id: string
  name: string
  email: string
  phone?: string
  avatarUrl?: string
  role: string
  permissions: string[] | Record<string, boolean>
  type: string
  isActive: boolean
  storeId?: string
  storeName?: string
  zoneId?: string
  createdAt: string
  updatedAt: string
}

// ─── Helpers ───

function mapRole(apiRole: string): UserRole {
  const ROLE_MAP: Record<string, UserRole> = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    super_admin: 'SUPER_ADMIN',
    ADMIN: 'ADMIN',
    admin: 'ADMIN',
    VENDOR: 'VENDOR',
    vendor: 'VENDOR',
    VENDOR_EMPLOYEE: 'VENDOR_EMPLOYEE',
    vendor_employee: 'VENDOR_EMPLOYEE',
  }
  return ROLE_MAP[apiRole] ?? 'VENDOR_EMPLOYEE'
}

function buildAuthUserFromMe(data: MeResponse): AuthUser {
  // Safety: role may come as string or object
  const rawRole = data.role as unknown
  const roleStr = typeof rawRole === 'object' && rawRole !== null
    ? (rawRole as any).name ?? 'ADMIN'
    : (rawRole as string) || 'ADMIN'
  const role = mapRole(roleStr)

  // Safety: permissions may be array or JSON object
  let perms: Permission[]
  if (Array.isArray(data.permissions)) {
    perms = data.permissions as Permission[]
  } else if (data.permissions && typeof data.permissions === 'object') {
    perms = Object.entries(data.permissions as Record<string, boolean>)
      .filter(([, v]) => v)
      .map(([k]) => k) as Permission[]
  } else {
    perms = []
  }

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    firstName: data.name?.split(' ')[0],
    lastName: data.name?.split(' ').slice(1).join(' ') || undefined,
    role,
    permissions: perms.length > 0 ? perms : DEFAULT_ROLE_PERMISSIONS[role] ?? [],
    storeId: data.storeId,
    storeName: data.storeName,
    avatar: data.avatarUrl,
    status: data.isActive ? 'ACTIVE' : 'INACTIVE',
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  }
}

// ─── useLogin ───

export function useLogin() {
  const { auth } = useAuthStore()

  return useMutation<
    { user: AuthUser; accessToken: string; refreshToken: string; _credentials: LoginRequest },
    Error,
    LoginRequest
  >({
    mutationFn: async (credentials: LoginRequest) => {
      // Wallet-API login (único endpoint de auth em produção)
      const loginUrl = buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGIN)
      console.log('🔐 Login (wallet-api):', credentials.email)

      const res = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      })

      if (!res.ok) {
        let errorMessage = `Erro ${res.status}: ${res.statusText}`
        try {
          const errorData = await res.json()
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch {
          // ignore parse errors
        }
        throw new Error(errorMessage)
      }

      const data = await res.json()
      console.log('✅ Login OK')

      // Normalizar resposta — wallet-api pode retornar formatos variados
      const rawUser = data.admin ?? data.vendor ?? data.user ?? data
      const rawRole = rawUser?.role ?? data.role ?? 'ADMIN'
      const roleStr = typeof rawRole === 'object' && rawRole !== null
        ? (rawRole as any).name ?? 'ADMIN'
        : String(rawRole)
      const role = mapRole(roleStr)

      const rawPerms = rawUser?.permissions ?? data.permissions
      let permissions: Permission[]
      if (Array.isArray(rawPerms)) {
        permissions = rawPerms as Permission[]
      } else if (rawPerms && typeof rawPerms === 'object') {
        permissions = Object.entries(rawPerms as Record<string, boolean>)
          .filter(([, v]) => v)
          .map(([k]) => k) as Permission[]
      } else {
        permissions = []
      }

      const user: AuthUser = {
        id: rawUser?.id ?? data.id ?? '',
        email: rawUser?.email ?? credentials.email,
        name: rawUser?.name ?? rawUser?.email ?? credentials.email,
        role,
        permissions: permissions.length > 0 ? permissions : DEFAULT_ROLE_PERMISSIONS[role] ?? [],
        storeId: rawUser?.storeId ?? rawUser?.store?.id,
        storeName: rawUser?.storeName ?? rawUser?.store?.name,
        status: 'ACTIVE',
        createdAt: rawUser?.createdAt ?? new Date().toISOString(),
        updatedAt: rawUser?.updatedAt ?? new Date().toISOString(),
      }

      const accessToken = data.accessToken ?? data.token ?? data.access_token ?? ''
      const refreshToken = data.refreshToken ?? data.refresh_token ?? ''

      return { user, accessToken, refreshToken, _credentials: credentials }
    },
    onSuccess: (result) => {
      auth.setUser(result.user)
      auth.setAccessToken(result.accessToken)
      auth.setRefreshToken(result.refreshToken)
      // Silently try PHP login to obtain a PHP-compatible token for order details
      tryPhpLogin(result._credentials.email, result._credentials.password).catch(() => {})
      toast.success(`Bem-vindo, ${result.user.name}!`)
    },
    onError: (error: Error) => {
      console.error('Erro no login:', error)
      toast.error(error.message || 'Erro ao fazer login')
    },
  })
}

// ─── useLogout ───

export function useLogout() {
  const { auth } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      const token = auth.accessToken
      const refreshToken = auth.refreshToken

      if (refreshToken) {
        try {
          await fetch(buildVmApiUrl(VM_API.ENDPOINTS.AUTH.LOGOUT), {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          })
        } catch {
          // ignore
        }
      }
    },
    onSettled: () => {
      auth.reset()
      queryClient.clear()
      toast.success('Logout realizado com sucesso')
    },
  })
}

// ─── useCurrentUser ───

export function useCurrentUser() {
  const { auth } = useAuthStore()

  return useQuery<MeResponse>({
    queryKey: ['current-user', auth.accessToken],
    queryFn: async () => {
      const token = auth.accessToken
      if (!token) throw new Error('Token não encontrado')

      const response = await fetch(buildVmApiUrl(VM_API.ENDPOINTS.AUTH.ME), {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      return response.json()
    },
    enabled: !!auth.accessToken,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount: number, error: any) => {
      if (error?.message?.includes('401')) return false
      return failureCount < 3
    },
  })
}

// ─── useRefreshToken ───

export function useRefreshToken() {
  const { auth } = useAuthStore()

  return useMutation<{ accessToken: string; refreshToken: string }, Error, void>({
    mutationFn: async () => {
      const refreshToken = auth.refreshToken
      if (!refreshToken) throw new Error('Refresh token não encontrado')

      const response = await fetch(buildVmApiUrl(VM_API.ENDPOINTS.AUTH.REFRESH), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      return response.json()
    },
    onSuccess: (data) => {
      auth.setAccessToken(data.accessToken)
      auth.setRefreshToken(data.refreshToken)
    },
    onError: () => {
      auth.reset()
    },
  })
}
