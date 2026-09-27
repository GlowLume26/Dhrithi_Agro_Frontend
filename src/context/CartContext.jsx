import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { token, logout } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  const refreshCart = useCallback(async () => {
    if (!token) { setCartCount(0); return; }
    try {
      const res = await api.get('cart');
      if (res.success && res.data?.items) setCartCount(res.data.items.length);
      else if (res.status === 401 || res.message?.toLowerCase().includes('unauthorized')) { logout(); setCartCount(0); }
      else setCartCount(0);
    } catch { setCartCount(0); }
  }, [token, logout]);

  // expose token so consumers can guard calls
  const isLoggedIn = !!token;

  return (
    <CartContext.Provider value={{ cartCount, setCartCount, refreshCart, isLoggedIn }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
