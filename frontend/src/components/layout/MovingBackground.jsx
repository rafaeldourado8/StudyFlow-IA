import { motion } from 'framer-motion';

const MovingBackground = () => {
  // Cores atualizadas para o tema Black/Cinza/Prata
  const orbs = [
    { color: '#1a1a1a', size: 'w-96 h-96', x: '10%', y: '20%', duration: 20 }, // Cinza Escuro Profundo
    { color: '#404040', size: 'w-80 h-80', x: '70%', y: '60%', duration: 25 }, // Cinza Médio
    { color: '#262626', size: 'w-64 h-64', x: '40%', y: '80%', duration: 30 }, // Cinza Carvão
    { color: '#525252', size: 'w-72 h-72', x: '80%', y: '30%', duration: 18 }, // Cinza Claro (Spotlight)
  ];

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-black">
      {orbs.map((orb, index) => (
        <motion.div
          key={index}
          className={`absolute rounded-full blur-3xl opacity-30 ${orb.size}`}
          style={{
            backgroundColor: orb.color,
            left: orb.x,
            top: orb.y,
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Overlay opcional para garantir legibilidade e textura */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 pointer-events-none" />
    </div>
  );
};

export default MovingBackground;