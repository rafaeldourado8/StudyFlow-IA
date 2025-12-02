// frontend/src/components/journey/JourneyMap.jsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Star, Skull, CheckCircle, Play } from 'lucide-react';
import api from '../../services/api';
import SkeletonLoader from '../ui/SkeletonLoader';

const JourneyMap = ({ onPlayLevel }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/journey/map/').then(res => {
      setData(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <SkeletonLoader title="Carregando o Mapa..." />;

  const { worlds, progress } = data;

  return (
    <div className="pb-20 relative">
      {/* Linha do Tempo Central (Background) */}
      <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-white/5 -translate-x-1/2 z-0" />

      {worlds.map((world, wIdx) => {
        const isWorldLocked = wIdx > progress.current_world_index;
        const isWorldActive = wIdx === progress.current_world_index;

        return (
          <div key={world.id} className={`relative mb-24 ${isWorldLocked ? 'opacity-30 blur-sm grayscale' : ''}`}>
            
            {/* Título do Mundo */}
            <div className="sticky top-20 z-30 flex justify-center mb-12">
                <motion.div 
                    initial={{ y: -20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    className={`px-6 py-3 rounded-2xl bg-gradient-to-r ${world.color} border border-white/20 shadow-xl text-center backdrop-blur-md`}
                >
                    <h2 className="text-xl font-black text-white uppercase tracking-wider">{world.title}</h2>
                    <p className="text-xs text-white/80 mt-1">{world.description}</p>
                </motion.div>
            </div>

            {/* Trilha de Níveis */}
            <div className="flex flex-col items-center gap-12 z-10 relative">
              {world.levels.map((level, lIdx) => {
                // Lógica de Trava
                const isCompleted = progress.completed_levels.includes(level.id);
                // Nível atual é o primeiro não completado do mundo ativo
                const isCurrent = isWorldActive && lIdx === progress.current_level_index;
                const isLocked = !isCompleted && !isCurrent;

                // Efeito Zig-Zag
                const xOffset = lIdx % 2 === 0 ? '-translate-x-12' : 'translate-x-12';

                return (
                  <motion.button
                    key={level.id}
                    onClick={() => !isLocked && !isWorldLocked && onPlayLevel(level.id)}
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    whileHover={!isLocked ? { scale: 1.1 } : {}}
                    disabled={isLocked || isWorldLocked}
                    className={`
                      relative w-20 h-20 rounded-full flex items-center justify-center border-4 shadow-lg transition-all duration-300 ${xOffset}
                      ${isCompleted ? 'bg-green-600 border-green-400 text-white' : ''}
                      ${isCurrent ? 'bg-yellow-500 border-yellow-200 animate-pulse text-black' : ''}
                      ${isLocked ? 'bg-gray-800 border-gray-600 text-gray-500' : ''}
                    `}
                  >
                    {isCompleted ? <CheckCircle className="w-8 h-8" /> : 
                     isLocked ? <Lock className="w-6 h-6" /> : 
                     <Star className="w-8 h-8 fill-current" />}
                    
                    {/* Tooltip do Nível */}
                    <div className="absolute top-full mt-3 w-32 bg-black/80 p-2 rounded-lg border border-white/10 text-center pointer-events-none">
                        <p className="text-[10px] font-bold text-white leading-tight">{level.title}</p>
                    </div>
                  </motion.button>
                );
              })}

              {/* BOSS BATTLE */}
              <motion.button
                onClick={() => !isWorldLocked && onPlayLevel(world.boss.id)}
                className={`
                    relative w-32 h-32 mt-8 rotate-45 rounded-2xl border-4 flex items-center justify-center shadow-[0_0_50px_rgba(220,38,38,0.4)]
                    ${progress.completed_levels.includes(world.boss.id) 
                        ? 'bg-yellow-600 border-yellow-400' 
                        : 'bg-red-900 border-red-500'}
                `}
              >
                <div className="-rotate-45 flex flex-col items-center text-white">
                    <Skull className="w-12 h-12 mb-1" />
                    <span className="text-xs font-black uppercase tracking-widest">BOSS</span>
                </div>
              </motion.button>

            </div>
          </div>
        );
      })}
    </div>
  );
};

export default JourneyMap;