import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, BookOpen, Swords, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import GlassCard from '../ui/GlassCard';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Lógica de "Smart Navbar" (Scroll-Aware)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Oculta se rolar para baixo (mais de 10px de diferença e não estar no topo)
      // Mostra se rolar para cima ou estiver no topo
      if (currentScrollY > lastScrollY + 10 && currentScrollY > 50) {
         setIsVisible(false);
      } else if (currentScrollY < lastScrollY - 10 || currentScrollY < 50) {
         setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };
    
    // Passive listener para melhor performance de scroll
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const tabs = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/tasks', icon: BookOpen, label: 'Conhecimentos' },
    { path: '/ai', icon: Swords, label: 'Arena' },
    { path: '/profile', icon: User, label: 'Perfil' },
  ];

  return (
    <AnimatePresence>
      <motion.nav
        className="fixed bottom-0 left-0 right-0 z-50 p-4"
        initial={{ y: 100, opacity: 0 }}
        animate={{ 
          y: isVisible ? 0 : 100, // Esconde movendo para baixo
          opacity: isVisible ? 1 : 0 
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        <GlassCard className="p-2 backdrop-blur-xl bg-black/60 border-white/10 shadow-2xl">
          <div className="flex justify-around items-center">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = location.pathname === tab.path;
              
              return (
                <button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  className="relative flex flex-col items-center p-2 rounded-xl transition-all duration-300 group"
                >
                  <div className={`p-1.5 rounded-full transition-all duration-300 ${
                    isActive 
                      ? 'bg-purple-500/20 text-purple-400' 
                      : 'text-gray-400 group-hover:text-white group-hover:bg-white/5'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <span className={`text-[10px] font-medium mt-1 transition-colors ${
                    isActive ? 'text-white' : 'text-gray-500'
                  }`}>
                    {tab.label}
                  </span>

                  {isActive && (
                    <motion.div
                      className="absolute -bottom-1 w-1 h-1 bg-purple-400 rounded-full"
                      layoutId="activeTabIndicator"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </GlassCard>
      </motion.nav>
    </AnimatePresence>
  );
};

export default Navigation;