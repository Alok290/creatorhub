import React, { createContext, useContext, useState, useEffect } from 'react';
import { Role, User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  role: Role | null;
  token: string | null;
  loading: boolean;
  login: (phone: string, otpOrPassword: string) => Promise<void>;
  register: (phone: string, role: Role, otpOrPassword?: string, email?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('creatorhub_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('creatorhub_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const role: Role | null = user?.role || null;

  const refreshUser = async () => {
    try {
      const profile = await authService.getCurrentUser();
      setUser(profile);
      localStorage.setItem('creatorhub_user', JSON.stringify(profile));
    } catch (err) {
      console.warn('Failed to refresh user profile, session may have expired:', err);
      logout();
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        await refreshUser();
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (phone: string, otpOrPassword: string) => {
    const res = await authService.login(phone, otpOrPassword);
    setToken(res.token);
    const profile = await authService.getCurrentUser();
    setUser(profile);
    localStorage.setItem('creatorhub_user', JSON.stringify(profile));
  };

  const register = async (phone: string, selectedRole: Role, otpOrPassword?: string, email?: string) => {
    const res = await authService.register(phone, selectedRole, otpOrPassword, email);
    setToken(res.token);
    const profile = await authService.getCurrentUser();
    setUser(profile);
    localStorage.setItem('creatorhub_user', JSON.stringify(profile));
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, role, token, loading, login, register, logout, refreshUser }}>
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

