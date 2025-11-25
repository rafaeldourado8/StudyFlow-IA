import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', hover = false, ...props }) => {
  return (
    <motion.div
      className={`
        bg-black/30 backdrop-blur-md border border-white/10 
        rounded-2xl transition-all duration-300
        ${hover ? 'hover:border-purple-500/50 hover:bg-black/40' : ''}
        ${className}
      `}
      whileHover={hover ? { scale: 1.02 } : {}}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;