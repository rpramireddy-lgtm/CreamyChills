import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authAPI } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null);
    
    // Notify server to invalidate refresh token
    authAPI.logout().catch(() => {});
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const response = await authAPI.getProfile();
          setUser(response.data);
          setToken(savedToken);
        } catch (error: any) {
          if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            setToken(null);
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authAPI.login({ email, password });
    const { token: newToken, refreshToken, user: userData } = response.data;
    
    localStorage.setItem('token', newToken);
    localStorage.setItem('refreshToken', refreshToken);
    setToken(newToken);
    setUser(userData);
  };

  const register = async (userData: { name: string; email: string; password: string; phone?: string }) => {
    const response = await authAPI.register(userData);
    const { token: newToken, refreshToken, user: newUser } = response.data;
    
    localStorage.setItem('token', newToken);
    localStorage.setItem('refreshToken', refreshToken);
    setToken(newToken);
    setUser(newUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
