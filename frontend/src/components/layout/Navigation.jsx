import { motion } from 'framer-motion';
import { Home, CheckSquare, MessageCircle, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { path: '/ai', icon: MessageCircle, label: 'AI Tutor' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 z-50 p-4"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <GlassCard className="p-2">
        <div className="flex justify-around items-center">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path;
            
            return (
              <motion.button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center p-2 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'text-purple-400' 
                    : 'text-gray-400 hover:text-white'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs mt-1">{tab.label}</span>
                {isActive && (
                  <motion.div
                    className="w-1 h-1 bg-purple-400 rounded-full mt-1"
                    layoutId="activeTab"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </GlassCard>
    </motion.nav>
  );
};

export default Navigation;