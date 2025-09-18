import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

const ACCESS_TOKEN = 'accessToken'
const REFRESH_TOKEN = 'refreshToken'

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

export const useAuthStore = create<AuthState>()((set, get) => {
  const cookieAccessToken = getCookie(ACCESS_TOKEN)
  const cookieRefreshToken = getCookie(REFRESH_TOKEN)
  const initAccessToken = cookieAccessToken ? JSON.parse(cookieAccessToken) : ''
  const initRefreshToken = cookieRefreshToken ? JSON.parse(cookieRefreshToken) : ''

  return {
    auth: {
      user: null,
      setUser: (user) =>
        set((state) => ({ ...state, auth: { ...state.auth, user } })),
      accessToken: initAccessToken,
      setAccessToken: (accessToken) =>
        set((state) => {
          setCookie(ACCESS_TOKEN, JSON.stringify(accessToken))
          return { ...state, auth: { ...state.auth, accessToken } }
        }),
      refreshToken: initRefreshToken,
      setRefreshToken: (refreshToken) =>
        set((state) => {
          setCookie(REFRESH_TOKEN, JSON.stringify(refreshToken))
          return { ...state, auth: { ...state.auth, refreshToken } }
        }),
      reset: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          removeCookie(REFRESH_TOKEN)
          return {
            ...state,
            auth: { ...state.auth, user: null, accessToken: '', refreshToken: '' },
          }
        }),
      isAuthenticated: () => {
        const { user, accessToken } = get().auth
        return !!(user && accessToken)
      },
    },
  }
})
