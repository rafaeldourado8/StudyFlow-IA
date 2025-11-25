import api from './api';

export const authService = {
  async login(email, password) {
    // Django REST Framework prefere JSON por padrão
    const payload = {
      email: email,
      password: password
    };

    // Rota correta conforme seu urls.py
    const response = await api.post('/api/auth/login/', payload);
    return response.data;
  },

  async getCurrentUser() {
    // Rota correta para o "Me"
    const response = await api.get('/api/users/auth/me/');
    return response.data;
  },
};