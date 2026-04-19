import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('echochain_token'));
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const t = res.data.access_token;
    localStorage.setItem('echochain_token', t);
    setToken(t);
    return res.data;
  };

  const register = async (email, password, company_name) => {
    const res = await api.post('/auth/register', { email, password, company_name });
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
