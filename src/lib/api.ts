import axios from 'axios';
import { getCookie, setCookie } from '@/lib/cookies';

// Base URL da API — aponta para o domínio raiz (sem /wallet)
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:9001'

// ─── Instância principal (NestJS / public endpoints) ─────────────────
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getCookie('accessToken') || localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// ─── Instância para PHP Laravel (usa phpToken cookie) ────────────────
export const phpApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

phpApi.interceptors.request.use(
  (config) => {
    const token = getCookie('phpToken') || getCookie('accessToken') || localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Tenta fazer login no backend PHP com as credenciais fornecidas.
 * Salva o token no cookie 'phpToken' se bem-sucedido.
 * Falha silenciosamente — não quebra o fluxo principal.
 */
export async function tryPhpLogin(email: string, password: string): Promise<void> {
  const endpoints = [
    '/admin/auth/login',
    '/api/v1/admin/auth/login',
    '/api/v1/auth/login',
    '/resturant/auth/login',
  ]
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (res.ok) {
        const data = await res.json()
        const token = data.token ?? data.access_token ?? data.accessToken ?? null
        if (token && typeof token === 'string' && token.length > 10) {
          setCookie('phpToken', token)
          return
        }
      }
    } catch {
      // try next endpoint
    }
  }
}

export default api;