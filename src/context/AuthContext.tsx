import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role, AppSettings } from '../types';
import { api, getAuthToken } from '../lib/api';

interface AuthContextType {
  user: User | null;
  role: Role | null;
  isLoading: boolean;
  settings: AppSettings | null;
  refreshSettings: () => Promise<void>;
  login: (data: { email: string; password: string }) => Promise<Role>;
  register: (data: { fullName: string; email: string; password: string }) => Promise<Role>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUserAvatar: (avatarUrl: string) => Promise<void>;
}

const defaultSettings: AppSettings = {
  official_whatsapp_group_url: 'https://chat.whatsapp.com/GHY74nxK9201Lkjq',
  official_support_whatsapp: 'https://wa.me/18005550199',
  official_support_instagram: 'https://instagram.com/nexaearn_official',
  official_support_email: 'support@nexaearn.com',
  platform_name: 'Nexa Earn',
  verification_bonus: 50,
  welcome_notice: 'Join our official WhatsApp group to complete verification.'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [settings, setSettings] = useState<AppSettings | null>(defaultSettings);

  const fetchSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const refreshUser = async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setRole(null);
      return;
    }
    try {
      const data = await api.getMe();
      setUser(data.user);
      setRole(data.role);
    } catch (err) {
      console.warn('Session invalid or expired');
      setUser(null);
      setRole(null);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.allSettled([refreshUser(), fetchSettings()]);
      setIsLoading(false);
    };
    init();
  }, []);

  const login = async (data: { email: string; password: string }): Promise<Role> => {
    const res = await api.login(data);
    setUser(res.user);
    setRole(res.role);
    return res.role;
  };

  const register = async (data: { fullName: string; email: string; password: string }): Promise<Role> => {
    const res = await api.register(data);
    setUser(res.user);
    setRole(res.role);
    return res.role;
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setRole(null);
  };

  const updateUserAvatar = async (avatarUrl: string) => {
    const res = await api.updateProfile({ avatarUrl });
    setUser(res.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoading,
        settings,
        refreshSettings: fetchSettings,
        login,
        register,
        logout,
        refreshUser,
        updateUserAvatar,
      }}
    >
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
