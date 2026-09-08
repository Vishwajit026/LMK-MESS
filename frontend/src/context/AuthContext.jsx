import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('lmk_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('lmk_token');
      if (token && !user) {
        try {
          const res = await authApi.getMe();
          if (res.data.success) {
            setUser(res.data.data);
            localStorage.setItem('lmk_user', JSON.stringify(res.data.data));
            connectSocket(res.data.data);
          }
        } catch (err) {
          localStorage.removeItem('lmk_token');
          localStorage.removeItem('lmk_user');
          setUser(null);
        }
      } else if (user) {
        connectSocket(user);
      }
    };
    initAuth();
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await authApi.login({ username, password });
      if (res.data.success) {
        const userData = res.data.data;
        setUser(userData);
        localStorage.setItem('lmk_token', userData.token);
        localStorage.setItem('lmk_user', JSON.stringify(userData));
        connectSocket(userData);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Check credentials.';
      setAuthError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, password, avatar, bio) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await authApi.register({ username, password, avatar, bio });
      if (res.data.success) {
        const userData = res.data.data;
        setUser(userData);
        localStorage.setItem('lmk_token', userData.token);
        localStorage.setItem('lmk_user', JSON.stringify(userData));
        connectSocket(userData);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Try a different username.';
      setAuthError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const guestJoin = async (guestUsername, guestAvatar) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await authApi.guestLogin({ username: guestUsername, avatar: guestAvatar });
      if (res.data.success) {
        const userData = res.data.data;
        setUser(userData);
        localStorage.setItem('lmk_token', userData.token);
        localStorage.setItem('lmk_user', JSON.stringify(userData));
        connectSocket(userData);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Guest join failed.';
      setAuthError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('lmk_token');
    localStorage.removeItem('lmk_user');
    setUser(null);
    disconnectSocket();
  };

  const updateStatus = (newStatus) => {
    if (!user) return;
    const updated = { ...user, status: newStatus };
    setUser(updated);
    localStorage.setItem('lmk_user', JSON.stringify(updated));
    connectSocket(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        setAuthError,
        login,
        register,
        guestJoin,
        logout,
        updateStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
