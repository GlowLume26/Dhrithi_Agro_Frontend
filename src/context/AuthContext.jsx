import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('da_token'));
  const [user, setUser]   = useState(() => JSON.parse(localStorage.getItem('da_user') || 'null'));

  function saveAuth(t, u) {
    localStorage.setItem('da_token', t);
    localStorage.setItem('da_user', JSON.stringify(u));
    setToken(t); setUser(u);
  }

  function logout() {
    localStorage.removeItem('da_token');
    localStorage.removeItem('da_user');
    setToken(null); setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, saveAuth, logout, isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
