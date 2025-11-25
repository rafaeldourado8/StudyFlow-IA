import { motion } from 'framer-motion';

const GradientButton = ({ 
  children, 
  onClick, 
  disabled = false, 
  className = '',
  type = 'button',
  ...props 
}) => {
  return (
    <motion.button
      type={type}
      className={`
        bg-gradient-to-r from-purple-600 to-pink-600 
        text-white font-medium py-3 px-6 rounded-xl
        transition-all duration-300 transform
        hover:from-purple-700 hover:to-pink-700
        hover:shadow-lg hover:shadow-purple-500/25
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default GradientButton;