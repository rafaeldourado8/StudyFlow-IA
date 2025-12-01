// frontend/src/hooks/useUI.jsx - VERSÃO OTIMIZADA
import { useState, useContext, createContext, useCallback, useEffect } from 'react';

const UIContext = createContext();

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within a UIProvider');
  return context;
};

export const UIProvider = ({ children }) => {
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [interactionTimeout, setInteractionTimeout] = useState(null);

  // Oculta navbar temporariamente durante interações
  const hideNavbarTemporarily = useCallback((duration = 3000) => {
    setIsNavbarVisible(false);
    
    // Limpa timeout anterior se existir
    if (interactionTimeout) {
      clearTimeout(interactionTimeout);
    }
    
    // Define novo timeout para mostrar novamente
    const timeout = setTimeout(() => {
      setIsNavbarVisible(true);
    }, duration);
    
    setInteractionTimeout(timeout);
  }, [interactionTimeout]);

  const hideNavbar = useCallback(() => setIsNavbarVisible(false), []);
  const showNavbar = useCallback(() => setIsNavbarVisible(true), []);

  // Detecta interações do usuário (cliques, toques, digitação)
  useEffect(() => {
    const handleInteraction = () => {
      // Oculta navbar por 3 segundos quando houver interação
      hideNavbarTemporarily(3000);
    };

    // Eventos de interação
    const events = ['click', 'touchstart', 'keydown', 'scroll'];
    
    events.forEach(event => {
      window.addEventListener(event, handleInteraction, { passive: true });
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleInteraction);
      });
      if (interactionTimeout) {
        clearTimeout(interactionTimeout);
      }
    };
  }, [hideNavbarTemporarily, interactionTimeout]);

  return (
    <UIContext.Provider value={{ 
      isNavbarVisible, 
      hideNavbar, 
      showNavbar,
      hideNavbarTemporarily 
    }}>
      {children}
    </UIContext.Provider>
  );
};