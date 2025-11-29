import api from './api';

export const authService = {
  /**
   * Login tradicional (Email/Senha)
   */
  login: async (email, password) => {
    const response = await api.post('/api/auth/login/', { 
      email, 
      password 
    });
    return response.data;
  },

  /**
   * Registro de novo usuário
   */
  register: async (name, email, password) => {
    // Note que a url agora aponta para o novo endpoint criado
    const response = await api.post('/api/users/auth/register/', {
      name,
      email,
      password
    });
    return response.data;
  },

  /**
   * Login com Google (Envia o 'code' para o backend trocar por tokens)
   */
  googleLogin: async (code) => {
    const response = await api.post('/api/auth/google/', {
      code, // O backend espera receber o código de autorização
    });
    return response.data;
  },

  refreshToken: async (refresh) => {
    const response = await api.post('/api/auth/refresh/', { 
      refresh 
    });
    return response.data;
  }
};