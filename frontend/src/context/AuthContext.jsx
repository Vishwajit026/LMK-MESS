import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('taskplanet_token'));
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'signup'

  // Initialize and verify existing token
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('taskplanet_token');
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            logout();
          }
        } catch (error) {
          console.error('Failed to restore session:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const res = await authAPI.login(credentials);
      if (res.success && res.token) {
        localStorage.setItem('taskplanet_token', res.token);
        setToken(res.token);
        setUser(res.user);
        setAuthModalOpen(false);
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Login failed';
      return { success: false, message: msg };
    }
  };

  const signup = async (userData) => {
    try {
      const res = await authAPI.signup(userData);
      if (res.success && res.token) {
        localStorage.setItem('taskplanet_token', res.token);
        setToken(res.token);
        setUser(res.user);
        setAuthModalOpen(false);
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message || 'Signup failed' };
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Signup failed';
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('taskplanet_token');
    setToken(null);
    setUser(null);
  };

  const openAuthModal = (tab = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        authModalOpen,
        authModalTab,
        login,
        signup,
        logout,
        openAuthModal,
        closeAuthModal,
        setAuthModalTab
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
