import { createContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService.js';
import { setAccessToken, clearAccessToken } from '../services/api.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Initialize auth state on mount by attempting refresh or getMe
  const checkAuth = useCallback(async () => {
    try {
      // First attempt to exchange cookie for access token
      const refreshRes = await authService.refresh();
      const token = refreshRes.data.data.accessToken;
      setAccessToken(token);

      const meRes = await authService.getMe();
      setUser(meRes.data.data.user);
    } catch (_) {
      // Not logged in or session expired — fine
      setUser(null);
      clearAccessToken();
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    const { accessToken, user: userData } = res.data.data;
    setAccessToken(accessToken);
    setUser(userData);
    return userData;
  };

  const register = async (formData) => {
    const res = await authService.register(formData);
    const { accessToken, user: userData } = res.data.data;
    setAccessToken(accessToken);
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (_) {
      // Ignore network errors on logout
    } finally {
      clearAccessToken();
      setUser(null);
    }
  };

  const updateUser = (updated) => {
    setUser((prev) => (prev ? { ...prev, ...updated } : updated));
  };

  const role = user?.role || null;
  const isAuthenticated = Boolean(user);
  const isAdmin = role === 'admin';
  const isTeacher = role === 'teacher';
  const isStudent = role === 'student';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        initialized,
        isAuthenticated,
        role,
        isAdmin,
        isTeacher,
        isStudent,
        login,
        register,
        logout,
        updateUser,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
