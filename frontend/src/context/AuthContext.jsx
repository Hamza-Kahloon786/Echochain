import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token,   setToken]   = useState(localStorage.getItem('echochain_token'));
  const [loading, setLoading] = useState(!!localStorage.getItem('echochain_token')); // true while validating

  // Validate stored token on mount — clears it if the backend rejects it
  useEffect(() => {
    const stored = localStorage.getItem('echochain_token');
    if (!stored) { setLoading(false); return; }

    api.get('/auth/me')
      .then(() => setLoading(false))
      .catch(() => {
        localStorage.removeItem('echochain_token');
        setToken(null);
        setLoading(false);
      });
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const t = res.data.access_token;
    localStorage.setItem('echochain_token', t);
    setToken(t);
    return res.data;
  };

  const register = async (email, password, company_name, full_name = '', company_phone = '', company_address = '') => {
    const res = await api.post('/auth/register', { email, password, company_name, full_name, company_phone, company_address });
    const t = res.data.access_token;
    localStorage.setItem('echochain_token', t);
    setToken(t);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('echochain_token');
    setToken(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, login, register, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
