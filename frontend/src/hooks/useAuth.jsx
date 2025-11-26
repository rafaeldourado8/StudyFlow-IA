import { useState, useContext, createContext, useEffect } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Recupera o token ao carregar a página
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token && token !== 'undefined') {
      // Define um usuário temporário visualmente até validar
      setUser({ email: 'user@session.com' }); 
    }
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const data = await authService.login(email, password);
      
      // 🚨 AQUI ESTÁ A CORREÇÃO CRÍTICA: 'data.access', não 'data.access_token'
      if (data.access) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        
        if (data.user) {
          setUser(data.user);
        } else {
          setUser({ email }); 
        }
        return { success: true };
      } else {
        console.error("Token não recebido:", data);
        return { success: false, error: 'Token não encontrado na resposta' };
      }

    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.response?.data?.detail || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    window.location.href = '/login';
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!localStorage.getItem('access_token') && localStorage.getItem('access_token') !== 'undefined',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};