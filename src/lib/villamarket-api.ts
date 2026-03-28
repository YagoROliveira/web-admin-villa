import axios from 'axios'
import { useAuthStore } from '@/stores/auth-store'

/**
 * Axios instance for the VillaMarket NestJS API (port 5001).
 * Handles auth via Bearer token from the Zustand auth store (cookies).
 */

const VILLAMARKET_API_URL =
  import.meta.env.VITE_VILLAMARKET_API_URL || 'http://localhost:5001'

export const villamarketApi = axios.create({
  baseURL: VILLAMARKET_API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ─── Request interceptor: attach Bearer token ───
villamarketApi.interceptors.request.use(
  (config) => {
    const { auth } = useAuthStore.getState()
    const token = auth.accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ─── Response interceptor: handle 401 ───
villamarketApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Try refresh once
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const { auth } = useAuthStore.getState()
      const refreshToken = auth.refreshToken

      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${VILLAMARKET_API_URL}/v1/auth/refresh`,
            { refreshToken },
          )
          auth.setAccessToken(data.accessToken)
          auth.setRefreshToken(data.refreshToken)

          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
          return villamarketApi(originalRequest)
        } catch {
          // Refresh failed — force logout
          auth.reset()
          window.location.href = '/sign-in'
          return Promise.reject(error)
        }
      }

      // No refresh token — force logout
      auth.reset()
      window.location.href = '/sign-in'
    }

    return Promise.reject(error)
  },
)

export default villamarketApi
