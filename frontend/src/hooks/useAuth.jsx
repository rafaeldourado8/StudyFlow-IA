import { useState, useContext, createContext } from 'react';
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

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const data = await authService.login(email, password);
      localStorage.setItem('access_token', data.access_token);
      // Optionally fetch user data here
      setUser({ email }); // Simplified user object
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.response?.data?.detail || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!localStorage.getItem('access_token'),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};