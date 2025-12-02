import { useState, useContext, createContext, useCallback, useRef, useEffect } from 'react';

const UIContext = createContext();

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within a UIProvider');
  return context;
};

export const UIProvider = ({ children }) => {
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const timeoutRef = useRef(null);

  const hideNavbarTemporarily = useCallback((duration = 3000) => {
    setIsNavbarVisible(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsNavbarVisible(true);
      timeoutRef.current = null;
    }, duration);
  }, []);

  const hideNavbar = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsNavbarVisible(false);
  }, []);

  const showNavbar = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsNavbarVisible(true);
  }, []);

  // Optional: also listen to global interactions here (if you prefer central handling)
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <UIContext.Provider value={{
      isNavbarVisible,
      hideNavbarTemporarily,
      hideNavbar,
      showNavbar
    }}>
      {children}
    </UIContext.Provider>
  );
};