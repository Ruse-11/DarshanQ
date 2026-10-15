import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API = import.meta.env.VITE_API_URL;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);     // { id, name, phone, role }
  const [token, setToken] = useState(null);   // JWT string
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('dq_token');
    const savedUser = localStorage.getItem('dq_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  async function login(phone, password) {
    const res = await axios.post(`${API}/auth/login`, { phone, password });
    _persist(res.data.user, res.data.token);
    return res.data;
  }

  async function register(name, phone, password, role) {
    const res = await axios.post(`${API}/auth/register`, { name, phone, password, role });
    _persist(res.data.user, res.data.token);
    return res.data;
  }

  function logout() {
    localStorage.removeItem('dq_token');
    localStorage.removeItem('dq_user');
    setUser(null);
    setToken(null);
  }

  function _persist(user, token) {
    localStorage.setItem('dq_token', token);
    localStorage.setItem('dq_user', JSON.stringify(user));
    setUser(user);
    setToken(token);
  }

  // Axios instance pre-configured with auth header
  const authAxios = axios.create({ baseURL: API });
  authAxios.interceptors.request.use((config) => {
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, authAxios }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
