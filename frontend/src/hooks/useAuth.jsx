import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API = 'http://localhost:8000/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user') || sessionStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleLogin = () => {
      const saved = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (saved) setUser(JSON.parse(saved));
    };
    window.addEventListener('userLogin', handleLogin);
    window.addEventListener('storage', handleLogin);
    return () => {
      window.removeEventListener('userLogin', handleLogin);
      window.removeEventListener('storage', handleLogin);
    };
  }, []);

  const login = async (email, password) => {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);
    const res = await axios.post(`${API}/auth/login`, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.setItem('token', access_token);
    sessionStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    window.dispatchEvent(new Event('userLogin'));
    return res.data;
  };

  const register = async (data) => {
    const res = await axios.post(`${API}/auth/register`, data);
    const { access_token, user: userData } = res.data;
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.setItem('token', access_token);
    sessionStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return res.data;
  };

  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}