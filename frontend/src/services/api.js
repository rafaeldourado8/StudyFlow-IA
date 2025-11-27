import axios from 'axios';

// CORREÇÃO: Alterado de '/api' para '' (string vazia).
// Isso evita a duplicação de rota (ex: /api/api/auth/login), pois os arquivos
// de serviço (auth.js, ai.js, etc) já incluem o prefixo '/api' nas chamadas.
const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    
    // Verifica se o token existe e não é a string "undefined" ou "null"
    if (token && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Se der 401 (Não autorizado), limpa o storage e redireciona para login
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;