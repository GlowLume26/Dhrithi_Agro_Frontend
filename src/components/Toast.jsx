import { useState, useEffect, createContext, useContext, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [msg, setMsg] = useState('');
  const [visible, setVisible] = useState(false);

  const showToast = useCallback((m) => {
    setMsg(m); setVisible(true);
    setTimeout(() => setVisible(false), 2500);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {visible && (
        <div style={{
          position:'fixed', bottom:'80px', left:'50%', transform:'translateX(-50%)',
          background:'#1b5e20', color:'white', padding:'12px 24px', borderRadius:'30px',
          fontSize:'14px', fontWeight:600, zIndex:9999,
          boxShadow:'0 4px 20px rgba(0,0,0,0.2)', pointerEvents:'none'
        }}>{msg}</div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
