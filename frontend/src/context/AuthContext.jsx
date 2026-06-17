import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token,   setToken]   = useState(localStorage.getItem('Chain scope AI_token'));
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem('Chain scope AI_token'));

  const fetchMe = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch {
      localStorage.removeItem('Chain scope AI_token');
      setToken(null);
      setUser(null);
    }
  }, []);

  // Validate stored token on mount
  useEffect(() => {
    const stored = localStorage.getItem('Chain scope AI_token');
    if (!stored) { setLoading(false); return; }
    fetchMe().finally(() => setLoading(false));
  }, [fetchMe]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const t = res.data.access_token;
    localStorage.setItem('Chain scope AI_token', t);
    setToken(t);
    // Fetch full user profile (includes role) and return it so callers
    // can navigate immediately without waiting for a re-render cycle.
    const me = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${t}` },
    });
    setUser(me.data);
    return me.data; // { id, email, company_name, role, status, ... }
  };

  // Returns { message, email, is_admin } — does NOT log the user in
  // (unless the registered account is an admin, in which case access_token is set)
  const register = async (email, password, company_name, full_name = '', company_phone = '', company_address = '') => {
    const res = await api.post('/auth/register', { email, password, company_name, full_name, company_phone, company_address });
    if (res.data.access_token) {
      // Admin registration — auto-login
      localStorage.setItem('Chain scope AI_token', res.data.access_token);
      setToken(res.data.access_token);
      const me = await api.get('/auth/me');
      setUser(me.data);
    }
    return res.data; // { message, email, is_admin, access_token? }
  };

  const logout = () => {
    localStorage.removeItem('Chain scope AI_token');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout, isAuthenticated, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
