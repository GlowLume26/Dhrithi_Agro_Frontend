import { createContext, useContext, useState } from 'react';
import { ROLE_MODULES } from '../utils/constants';

const Ctx = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem('da_admin_user')); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('da_admin_token'));

  function login(tok, user) {
    localStorage.setItem('da_admin_token', tok);
    localStorage.setItem('da_admin_user', JSON.stringify(user));
    setToken(tok);
    setAdmin(user);
  }

  function logout() {
    localStorage.removeItem('da_admin_token');
    localStorage.removeItem('da_admin_user');
    setToken(null);
    setAdmin(null);
  }

  function can(module) {
    if (!admin) return false;
    return ROLE_MODULES[admin.role]?.includes(module) ?? false;
  }

  return (
    <Ctx.Provider value={{ admin, token, isLoggedIn: !!token, login, logout, can }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAdminAuth = () => useContext(Ctx);
