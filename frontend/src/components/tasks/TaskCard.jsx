import { motion } from 'framer-motion';
import { Trash2, Check } from 'lucide-react';
import GlassCard from '../ui/GlassCard';

const TaskCard = ({ task, onToggle, onDelete }) => {
  const { id, title, completed } = task;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <GlassCard 
        className="p-4 mb-3 flex items-center justify-between group hover:border-purple-500/30"
        hover={true}
      >
        {/* Checkbox and Title */}
        <div className="flex items-center space-x-4 flex-1">
          <button
            onClick={() => onToggle(id)}
            className={`
              w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
              ${completed 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-transparent' 
                : 'border-gray-400 hover:border-purple-500'
              }
            `}
          >
            {completed && <Check className="w-4 h-4 text-white" />}
          </button>
          
          <span className={`
            text-white transition-all duration-300 flex-1
            ${completed ? 'line-through text-gray-400' : ''}
          `}>
            {title}
          </span>
        </div>

        {/* Delete Button */}
        <motion.button
          onClick={() => onDelete(id)}
          className="p-2 text-gray-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Trash2 className="w-4 h-4" />
        </motion.button>
      </GlassCard>
    </motion.div>
  );
};

export default TaskCard;