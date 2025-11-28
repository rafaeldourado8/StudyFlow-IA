import { motion } from 'framer-motion';
import { User, Zap, Crown, Brain, Code, Terminal, Rocket, Ghost } from 'lucide-react';

// Lista de Avatares disponíveis (apenas IDs e Configurações visuais)
export const AVATARS = [
  { id: 'default', icon: User, gradient: 'from-gray-600 to-gray-800' },
  { id: 'pro', icon: Crown, gradient: 'from-yellow-500 to-amber-700' },
  { id: 'hacker', icon: Terminal, gradient: 'from-green-500 to-emerald-800' },
  { id: 'brain', icon: Brain, gradient: 'from-pink-500 to-rose-800' },
  { id: 'speed', icon: Zap, gradient: 'from-blue-500 to-indigo-800' },
  { id: 'coder', icon: Code, gradient: 'from-purple-500 to-violet-800' },
  { id: 'rocket', icon: Rocket, gradient: 'from-orange-500 to-red-800' },
  { id: 'ghost', icon: Ghost, gradient: 'from-white/20 to-white/5' },
];

const AvatarSelector = ({ selectedId, onSelect }) => {
  return (
    <div className="grid grid-cols-4 gap-4 py-4">
      {AVATARS.map((avatar) => {
        const Icon = avatar.icon;
        const isSelected = selectedId === avatar.id;

        return (
          <motion.button
            key={avatar.id}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(avatar.id)}
            className={`
              relative w-16 h-16 rounded-full flex items-center justify-center
              bg-gradient-to-br ${avatar.gradient}
              ${isSelected ? 'ring-4 ring-white shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'opacity-70 hover:opacity-100'}
              transition-all duration-300
            `}
          >
            <Icon className="w-8 h-8 text-white" />
            
            {isSelected && (
              <motion.div 
                layoutId="activeAvatar"
                className="absolute inset-0 rounded-full border-2 border-white"
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
};

export default AvatarSelector;