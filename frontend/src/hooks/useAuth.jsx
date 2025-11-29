import { useState, useContext, createContext, useEffect } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token && token !== 'undefined') {
      // Idealmente, aqui você faria um fetch para /api/users/auth/me/ para pegar os dados reais
      setUser({ email: 'user@session.com' }); 
    }
  }, []);

  // Função auxiliar para processar o sucesso do login
  const handleAuthSuccess = (data) => {
    if (data.access) {
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      
      if (data.user) {
        setUser(data.user);
      } else {
        // Fallback se o backend não retornar o obj user no login social
        setUser({ authenticated: true }); 
      }
      return { success: true };
    }
    return { success: false, error: 'Token inválido recebido.' };
  };

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const data = await authService.login(email, password);
      return handleAuthSuccess(data);
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Falha no login.' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setIsLoading(true);
    try {
      await authService.register(name, email, password);
      // Após registrar, fazemos o login automático
      return login(email, password);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.email?.[0] || 'Erro ao criar conta.';
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (code) => {
    setIsLoading(true);
    try {
      const data = await authService.googleLogin(code);
      return handleAuthSuccess(data);
    } catch (error) {
      console.error("Google Auth Error:", error.response?.data);
      return { success: false, error: 'Falha na autenticação Google.' };
    } finally {
      setIsLoading(false);
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    window.location.href = '/login';
  };

  const value = {
    user,
    login,
    register,
    loginWithGoogle,
    logout,
    isLoading,
    isAuthenticated: !!localStorage.getItem('access_token'),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};