'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UserProfile {
  name: string;
  email: string;
  assignedRoom: 'room-alpha' | 'room-beta' | 'room-gamma';
  role: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean; // 🆕 Added hydration state
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // 🆕 Defaults to true until storage is checked
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem('gridpulse_token');
    const savedUser = localStorage.getItem('gridpulse_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false); // 🆕 Mark hydration complete
  }, []);

  const login = (newToken: string, newUser: UserProfile) => {
    localStorage.setItem('gridpulse_token', newToken);
    localStorage.setItem('gridpulse_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    router.push('/');
  };

  const logout = () => {
    localStorage.removeItem('gridpulse_token');
    localStorage.removeItem('gridpulse_user');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};