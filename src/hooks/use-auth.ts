import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { buildVmApiUrl, VM_API } from '@/config/api'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { DEFAULT_ROLE_PERMISSIONS } from '@/types/auth'
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
    { user: AuthUser; accessToken: string; refreshToken: string },
    Error,
    LoginRequest
  >({
    mutationFn: async (credentials: LoginRequest) => {
      // 1. Try NestJS admin login
      const adminUrl = buildVmApiUrl(VM_API.ENDPOINTS.AUTH.ADMIN_LOGIN)
      console.log('🔐 Login (NestJS admin):', credentials.email)

      const adminRes = await fetch(adminUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      })

      if (adminRes.ok) {
        const data: NestAdminLoginResponse = await adminRes.json()
        console.log('✅ NestJS Admin Login OK')

        // Safety: role may come as string or object {name: '...'}
        const rawRole = data.admin.role
        const roleStr = typeof rawRole === 'object' && rawRole !== null
          ? (rawRole as any).name ?? 'ADMIN'
          : rawRole ?? 'ADMIN'
        const role = mapRole(roleStr)

        // Safety: permissions may be array or object {dashboard: true, ...}
        const rawPerms = data.admin.permissions
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
          id: data.admin.id,
          email: data.admin.email,
          name: data.admin.name,
          role,
          permissions: permissions.length > 0 ? permissions : DEFAULT_ROLE_PERMISSIONS[role] ?? [],
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        return { user, accessToken: data.accessToken, refreshToken: data.refreshToken }
      }

      // 2. Try NestJS vendor login
      console.log('ℹ️ Admin login retornou', adminRes.status, '— tentando vendor...')

      const vendorRes = await fetch(buildVmApiUrl(VM_API.ENDPOINTS.AUTH.VENDOR_LOGIN), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      })

      if (vendorRes.ok) {
        const data: NestVendorLoginResponse = await vendorRes.json()
        console.log('✅ NestJS Vendor Login OK')

        const user: AuthUser = {
          id: data.vendor.id,
          email: data.vendor.email,
          name: data.vendor.name,
          role: 'VENDOR',
          permissions: DEFAULT_ROLE_PERMISSIONS.VENDOR,
          storeId: data.vendor.store?.id,
          storeName: data.vendor.store?.name,
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        return { user, accessToken: data.accessToken, refreshToken: data.refreshToken }
      }

      // Both failed — throw
      let errorMessage = `Erro ${vendorRes.status}: ${vendorRes.statusText}`
      try {
        const errorData = await vendorRes.json()
        errorMessage = errorData.message || errorMessage
      } catch {
        // ignore parse errors
      }
      throw new Error(errorMessage)
    },
    onSuccess: (result) => {
      auth.setUser(result.user)
      auth.setAccessToken(result.accessToken)
      auth.setRefreshToken(result.refreshToken)
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
