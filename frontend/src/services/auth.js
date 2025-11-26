import api from './api';

export const authService = {
  /**
   * Realiza o login enviando email e senha.
   */
  login: async (email, password) => {
    // Faz o POST para o endpoint de login do Django
    const response = await api.post('/api/auth/login/', { 
      email, 
      password 
    });
    
    // Retorna os dados (access, refresh, user, etc)
    return response.data;
  },

  /**
   * Opcional: Método para refresh manual, caso precise no futuro
   */
  refreshToken: async (refresh) => {
    const response = await api.post('/api/auth/refresh/', { 
      refresh 
    });
    return response.data;
  }
};