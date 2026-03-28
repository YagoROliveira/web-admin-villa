import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { buildVmApiUrl, VM_API } from '@/config/api'
import { DEFAULT_ROLE_PERMISSIONS } from '@/types/auth'
import type { AuthUser, UserRole, Permission } from '@/types/auth'

/**
 * Maps a role string from the NestJS API to the RBAC UserRole enum.
 */
function mapApiRoleToUserRole(apiRole: string): UserRole {
  switch (apiRole) {
    case 'SUPER_ADMIN':
    case 'super_admin':
      return 'SUPER_ADMIN'
    case 'ADMIN':
    case 'admin':
      return 'ADMIN'
    case 'VENDOR':
    case 'vendor':
      return 'VENDOR'
    case 'VENDOR_EMPLOYEE':
    case 'vendor_employee':
      return 'VENDOR_EMPLOYEE'
    case 'USER':
      return 'ADMIN'
    default:
      return 'VENDOR_EMPLOYEE'
  }
}

/**
 * Builds an AuthUser from the NestJS /v1/auth/me response.
 */
function buildAuthUser(data: Record<string, unknown>): AuthUser {
  // Safety: role may be a string or an object {name: '...'}  from the API
  const rawRole = data.role
  const roleStr = typeof rawRole === 'object' && rawRole !== null
    ? (rawRole as any).name ?? 'ADMIN'
    : (rawRole as string) || 'ADMIN'
  const role = mapApiRoleToUserRole(roleStr)

  // Safety: permissions may be an array or a JSON object {dashboard: true, ...}
  const rawPerms = data.permissions
  let permissions: Permission[]
  if (Array.isArray(rawPerms)) {
    permissions = rawPerms as Permission[]
  } else if (rawPerms && typeof rawPerms === 'object') {
    permissions = Object.entries(rawPerms as Record<string, boolean>)
      .filter(([, v]) => v)
      .map(([k]) => k) as Permission[]
  } else {
    permissions = DEFAULT_ROLE_PERMISSIONS[role] ?? []
  }

  return {
    id: data.id?.toString() || '',
    email: (data.email as string) || '',
    name: (data.name as string) || (data.email as string) || '',
    firstName: (data.name as string)?.split(' ')[0] || undefined,
    lastName: (data.name as string)?.split(' ').slice(1).join(' ') || undefined,
    role,
    permissions,
    storeId: (data.storeId as string) || undefined,
    storeName: (data.storeName as string) || undefined,
    avatar: (data.avatarUrl as string) || (data.avatar as string) || undefined,
    status: data.isActive ? 'ACTIVE' : 'INACTIVE',
    createdAt: (data.createdAt as string) || undefined,
    updatedAt: (data.updatedAt as string) || undefined,
  }
}

/**
 * Tenta fazer refresh do token usando o refreshToken (NestJS API)
 */
async function tryRefreshToken(): Promise<boolean> {
  const { auth } = useAuthStore.getState()
  const refreshToken = auth.refreshToken

  if (!refreshToken) return false

  try {
    console.log('🔄 Tentando refresh do token...')
    const response = await fetch(buildVmApiUrl(VM_API.ENDPOINTS.AUTH.REFRESH), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      console.error('❌ Refresh token falhou:', response.status)
      return false
    }

    const data = await response.json()
    auth.setAccessToken(data.accessToken)
    if (data.refreshToken) {
      auth.setRefreshToken(data.refreshToken)
    }
    console.log('✅ Token renovado com sucesso')
    return true
  } catch (error) {
    console.error('❌ Erro no refresh token:', error)
    return false
  }
}

/**
 * Loads the current user from the NestJS /v1/auth/me endpoint.
 */
async function loadCurrentUser(): Promise<void> {
  const { auth } = useAuthStore.getState()
  const currentToken = auth.accessToken

  const response = await fetch(buildVmApiUrl(VM_API.ENDPOINTS.AUTH.ME), {
    headers: {
      Authorization: `Bearer ${currentToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (response.status === 401) {
    const refreshed = await tryRefreshToken()
    if (refreshed) {
      const newToken = useAuthStore.getState().auth.accessToken
      const retryResponse = await fetch(buildVmApiUrl(VM_API.ENDPOINTS.AUTH.ME), {
        headers: {
          Authorization: `Bearer ${newToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!retryResponse.ok) {
        auth.reset()
        throw redirect({ to: '/sign-in' })
      }

      const userData = await retryResponse.json()
      auth.setUser(buildAuthUser(userData))
    } else {
      auth.reset()
      throw redirect({ to: '/sign-in' })
    }
  } else if (!response.ok) {
    console.error('❌ Erro ao carregar usuário:', response.status, response.statusText)
    auth.reset()
    throw redirect({ to: '/sign-in' })
  } else {
    const userData = await response.json()
    console.log('✅ Usuário carregado:', userData.email, '| Role:', userData.role)
    auth.setUser(buildAuthUser(userData))
  }
}

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const { auth } = useAuthStore.getState()

    if (!auth.accessToken) {
      const refreshed = await tryRefreshToken()
      if (!refreshed) {
        console.warn('🚫 Acesso negado: Token não encontrado')
        throw redirect({
          to: '/sign-in',
          search: { redirect: location.href },
        })
      }
    }

    if (!auth.user) {
      try {
        console.log('👤 Carregando informações do usuário com RBAC...')
        await loadCurrentUser()
      } catch (error: unknown) {
        if (error && typeof error === 'object' && ('to' in error || 'redirect' in error)) throw error
        console.error('❌ Erro ao validar autenticação:', error)
        auth.reset()
        throw redirect({
          to: '/sign-in',
          search: { redirect: location.href },
        })
      }
    }

    const user = useAuthStore.getState().auth.user
    console.log('✅ Acesso autorizado para:', user?.email, '| Role:', user?.role)
  },
  component: AuthenticatedLayout,
})
