'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, getToken, setToken } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | authed | guest

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setStatus('guest');
      return;
    }
    api('/auth/me')
      .then((data) => {
        setUser(data.user);
        setStatus('authed');
      })
      .catch(() => {
        setToken(null);
        setStatus('guest');
      });
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      isAdmin: user?.role === 'admin',
      async applySession(data) {
        setToken(data.token);
        setUser(data.user);
        setStatus('authed');
        return data.user;
      },
      async adminLogin(username, password) {
        const data = await api('/auth/admin', { method: 'POST', body: { username, password } });
        return this.applySession(data);
      },
      async demoLogin(role) {
        const data = await api('/auth/demo', { method: 'POST', body: { role } });
        return this.applySession(data);
      },
      async googleLogin(profile) {
        const data = await api('/auth/google', { method: 'POST', body: profile });
        return this.applySession(data);
      },
      async logout() {
        setToken(null);
        setUser(null);
        setStatus('guest');
      },
    }),
    [user, status]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
