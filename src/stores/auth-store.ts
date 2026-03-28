import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'
import type { AuthUser, Permission, UserRole, DEFAULT_ROLE_PERMISSIONS } from '@/types/auth'

const ACCESS_TOKEN = 'accessToken'
const REFRESH_TOKEN = 'refreshToken'
const USER_DATA = 'userData'

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    refreshToken: string
    setRefreshToken: (refreshToken: string) => void
    reset: () => void
    isAuthenticated: () => boolean
    /** Check if the user has a specific role */
    hasRole: (...roles: UserRole[]) => boolean
    /** Check if the user has a specific permission */
    hasPermission: (permission: Permission) => boolean
    /** Check if the user is an admin (SUPER_ADMIN or ADMIN) */
    isAdmin: () => boolean
    /** Check if the user is a vendor (VENDOR or VENDOR_EMPLOYEE) */
    isVendor: () => boolean
  }
}

function loadCookieValue(key: string): string {
  const raw = getCookie(key)
  if (!raw) return ''
  // Handle legacy double-JSON-stringified values
  try {
    const parsed = JSON.parse(raw)
    if (typeof parsed === 'string') return parsed
    return raw
  } catch {
    return raw
  }
}

function loadUser(): AuthUser | null {
  const raw = getCookie(USER_DATA)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && parsed.id) {
      // Safety: if role is an object (stale cookie from old API), extract name or reset
      if (parsed.role && typeof parsed.role === 'object') {
        parsed.role = parsed.role.name ?? 'ADMIN'
      }
      // Safety: ensure permissions is always an array
      if (parsed.permissions && !Array.isArray(parsed.permissions)) {
        parsed.permissions = typeof parsed.permissions === 'object'
          ? Object.entries(parsed.permissions).filter(([, v]) => v).map(([k]) => k)
          : []
      }
      return parsed
    }
    return null
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>()((set, get) => {
  const initAccessToken = loadCookieValue(ACCESS_TOKEN)
  const initRefreshToken = loadCookieValue(REFRESH_TOKEN)
  const initUser = loadUser()

  return {
    auth: {
      user: initUser,
      setUser: (user) =>
        set((state) => {
          if (user) {
            // Sanitize before persisting — role must be a string, permissions an array
            if (user.role && typeof user.role === 'object') {
              user = { ...user, role: (user.role as any).name ?? 'ADMIN' }
            }
            if (user.permissions && !Array.isArray(user.permissions)) {
              const perms = user.permissions as unknown
              user = {
                ...user,
                permissions: typeof perms === 'object' && perms !== null
                  ? Object.entries(perms as Record<string, boolean>).filter(([, v]) => v).map(([k]) => k) as any
                  : [],
              }
            }
            setCookie(USER_DATA, JSON.stringify(user))
          } else {
            removeCookie(USER_DATA)
          }
          return { ...state, auth: { ...state.auth, user } }
        }),
      accessToken: initAccessToken,
      setAccessToken: (accessToken) =>
        set((state) => {
          setCookie(ACCESS_TOKEN, accessToken)
          return { ...state, auth: { ...state.auth, accessToken } }
        }),
      refreshToken: initRefreshToken,
      setRefreshToken: (refreshToken) =>
        set((state) => {
          setCookie(REFRESH_TOKEN, refreshToken)
          return { ...state, auth: { ...state.auth, refreshToken } }
        }),
      reset: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          removeCookie(REFRESH_TOKEN)
          removeCookie(USER_DATA)
          return {
            ...state,
            auth: {
              ...state.auth,
              user: null,
              accessToken: '',
              refreshToken: '',
            },
          }
        }),
      isAuthenticated: () => {
        const { accessToken } = get().auth
        return !!accessToken
      },
      hasRole: (...roles: UserRole[]) => {
        const { user } = get().auth
        if (!user) return false
        return roles.includes(user.role)
      },
      hasPermission: (permission: Permission) => {
        const { user } = get().auth
        if (!user) return false
        // SUPER_ADMIN always has all permissions
        if (user.role === 'SUPER_ADMIN') return true
        return user.permissions?.includes(permission) ?? false
      },
      isAdmin: () => {
        const { user } = get().auth
        if (!user) return false
        return ['SUPER_ADMIN', 'ADMIN'].includes(user.role)
      },
      isVendor: () => {
        const { user } = get().auth
        if (!user) return false
        return ['VENDOR', 'VENDOR_EMPLOYEE'].includes(user.role)
      },
    },
  }
})
