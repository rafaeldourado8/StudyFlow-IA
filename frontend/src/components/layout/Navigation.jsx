// frontend/src/components/layout/Navigation.jsx - VERSÃO OTIMIZADA
import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, BookOpen, Swords, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import GlassCard from '../ui/GlassCard';
import { useUI } from '../../hooks/useUI';

const Navigation = memo(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isNavbarVisible, hideNavbarTemporarily } = useUI();
  
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Detecta mudanças no tamanho da tela
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lógica de scroll otimizada
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          if (currentScrollY > lastScrollY + 10 && currentScrollY > 50) {
            setIsVisible(false);
          } else if (currentScrollY < lastScrollY - 10 || currentScrollY < 50) {
            setIsVisible(true);
          }
          
          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Oculta navbar em interações do usuário
  useEffect(() => {
    const handleUserInteraction = () => {
      hideNavbarTemporarily(3000);
    };

    const events = ['click', 'touchstart', 'keydown'];
    events.forEach(event => {
      window.addEventListener(event, handleUserInteraction, { passive: true });
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [hideNavbarTemporarily]);

  const tabs = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/tasks', icon: BookOpen, label: 'Conhecimentos' },
    { path: '/ai', icon: Swords, label: 'Arena' },
    { path: '/profile', icon: User, label: 'Perfil' },
  ];

  const shouldShow = isVisible && isNavbarVisible;

  return (
    <AnimatePresence mode="wait">
      {shouldShow && (
        <motion.nav
          className={`fixed z-50 ${
            isMobile 
              ? 'bottom-0 left-0 right-0 p-3' 
              : 'bottom-4 left-1/2 -translate-x-1/2 w-auto'
          }`}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          <GlassCard className={`backdrop-blur-xl bg-black/60 border-white/10 shadow-2xl ${
            isMobile ? 'p-2' : 'p-3 px-6'
          }`}>
            <div className={`flex items-center ${
              isMobile ? 'justify-around' : 'gap-2'
            }`}>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = location.pathname === tab.path;
                
                return (
                  <button
                    key={tab.path}
                    onClick={() => navigate(tab.path)}
                    className={`relative flex items-center gap-2 rounded-xl transition-all duration-300 group ${
                      isMobile 
                        ? 'flex-col p-2' 
                        : 'flex-row px-4 py-2'
                    }`}
                    aria-label={tab.label}
                  >
                    <div className={`rounded-full transition-all duration-300 ${
                      isMobile ? 'p-1.5' : 'p-2'
                    } ${
                      isActive 
                        ? 'bg-purple-500/20 text-purple-400' 
                        : 'text-gray-400 group-hover:text-white group-hover:bg-white/5'
                    }`}>
                      <Icon className={isMobile ? 'w-5 h-5' : 'w-5 h-5'} />
                    </div>
                    
                    <span className={`font-medium transition-colors ${
                      isMobile ? 'text-[10px] mt-1' : 'text-sm'
                    } ${
                      isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'
                    }`}>
                      {tab.label}
                    </span>

                    {isActive && (
                      <motion.div
                        className={`absolute bg-purple-400 rounded-full ${
                          isMobile 
                            ? '-bottom-1 w-1 h-1' 
                            : 'left-0 top-0 bottom-0 w-1'
                        }`}
                        layoutId="activeTabIndicator"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </GlassCard>
        </motion.nav>
      )}
    </AnimatePresence>
  );
});

Navigation.displayName = 'Navigation';

export default Navigation;