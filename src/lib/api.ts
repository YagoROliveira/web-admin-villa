import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// Base URL da API
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://prod.villamarket.app:8443/wallet-api'
  : 'http://localhost:9001/wallet-api';

// Instância do axios
const api = axios.create({
  baseURL: 'http://localhost:9001/wallet-api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('authToken');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default api;