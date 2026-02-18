import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

const ACCESS_TOKEN = 'accessToken'
const REFRESH_TOKEN = 'refreshToken'
const USER_DATA = 'userData'

interface AuthUser {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'USER'
  balance?: number
  accountNo?: string
  createdAt?: string
  updatedAt?: string
}

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
    if (parsed && typeof parsed === 'object' && parsed.id) return parsed
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
    },
  }
})
