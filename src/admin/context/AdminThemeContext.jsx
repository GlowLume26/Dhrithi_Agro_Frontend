import { createContext, useContext, useState, useEffect } from 'react';

const Ctx = createContext(null);

export function AdminThemeProvider({ children }) {
  const [dark, setDark] = useState(() => localStorage.getItem('da_admin_dark') === 'true');

  useEffect(() => {
    localStorage.setItem('da_admin_dark', dark);
    document.documentElement.setAttribute('data-admin-theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <Ctx.Provider value={{ dark, toggle: () => setDark(d => !d) }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAdminTheme = () => useContext(Ctx);
