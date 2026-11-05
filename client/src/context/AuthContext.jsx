import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAuthToken, getAuthToken } from '../services/api';

const AuthContext = createContext();

export const DEMO_ACCOUNTS = [
  { name: 'Jane Reynolds', email: 'jane@gocreators.io', role: 'Director', label: 'Jane (Director - Main User)' },
  { name: 'Mark Davis', email: 'mark@gocreators.io', role: 'Cinematographer', label: 'Mark (DOP - Connected to Jane)' },
  { name: 'Ava Sterling', email: 'ava@gocreators.io', role: 'Actor', label: 'Ava (Actor - Pending Connection)' },
  { name: 'Elena Rostova', email: 'elena@gocreators.io', role: 'Cinematographer', label: 'Elena (DOP - Unconnected / Masked)' }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getAuthToken());
  const [loading, setLoading] = useState(true);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(1);
  const [isBlockedAlert, setIsBlockedAlert] = useState(null);

  const loadCurrentUser = async () => {
    try {
      if (!getAuthToken()) {
        // Auto-login default demo user (Jane Reynolds) for immediate interactive experience
        await loginWithDemo('jane@gocreators.io');
        return;
      }
      const data = await api.getMe();
      setUser(data.user);
      setIsBlockedAlert(null);
    } catch (err) {
      if (err.status === 403 && err.data?.isBlocked) {
        setIsBlockedAlert(err.data);
      }
      setAuthToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loginWithDemo = async (email = 'jane@gocreators.io') => {
    setLoading(true);
    try {
      const data = await api.login({ email, password: 'password123' });
      setAuthToken(data.token);
      setToken(data.token);
      setUser(data.user);
      setIsBlockedAlert(null);
      refreshPendingCount();
      return data;
    } catch (err) {
      if (err.status === 403 && err.data?.isBlocked) {
        setIsBlockedAlert(err.data);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    setAuthToken(data.token);
    setToken(data.token);
    setUser(data.user);
    setIsBlockedAlert(null);
    refreshPendingCount();
    return data;
  };

  const register = async (formData) => {
    const data = await api.register(formData);
    setAuthToken(data.token);
    setToken(data.token);
    setUser(data.user);
    setIsBlockedAlert(null);
    return data;
  };

  const logout = () => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
    setIsBlockedAlert(null);
  };

  const refreshPendingCount = async () => {
    try {
      if (!getAuthToken()) return;
      const data = await api.getConnections();
      setPendingRequestsCount(data.incoming?.length || 0);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      loginWithDemo,
      register,
      logout,
      refreshUser: loadCurrentUser,
      pendingRequestsCount,
      refreshPendingCount,
      isBlockedAlert,
      setIsBlockedAlert
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

