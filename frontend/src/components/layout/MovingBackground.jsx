import { motion } from 'framer-motion';

const MovingBackground = () => {
  const orbs = [
    { color: '#4c1d95', size: 'w-96 h-96', x: '10%', y: '20%', duration: 20 },
    { color: '#4338ca', size: 'w-80 h-80', x: '70%', y: '60%', duration: 25 },
    { color: '#be185d', size: 'w-64 h-64', x: '40%', y: '80%', duration: 30 },
    { color: '#7c3aed', size: 'w-72 h-72', x: '80%', y: '30%', duration: 18 },
  ];

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {orbs.map((orb, index) => (
        <motion.div
          key={index}
          className={`absolute rounded-full blur-3xl opacity-40 ${orb.size}`}
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
    </div>
  );
};

export default MovingBackground;