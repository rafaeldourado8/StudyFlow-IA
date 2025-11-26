import { motion } from 'framer-motion';

const SkeletonLoader = ({ title = "Estamos pensando..." }) => {
  return (
    <div className="w-full space-y-4 p-4">
      <div className="flex items-center gap-3 mb-4">
        <motion.div 
          className="w-5 h-5 rounded-full bg-purple-500"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <span className="text-purple-300 font-medium animate-pulse">{title}</span>
      </div>
      
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-1/4 bg-white/10 rounded animate-pulse" />
          <div className="h-16 w-full bg-white/5 rounded-lg animate-pulse" />
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;