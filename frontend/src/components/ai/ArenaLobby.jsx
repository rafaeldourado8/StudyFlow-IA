import { motion } from 'framer-motion';
import { Award, Trophy, Medal, Star, Crown, Play } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import GradientButton from '../ui/GradientButton';
import Navigation from '../layout/Navigation';

const ArenaLobby = ({ myMasteries, topic, setTopic, onStartGame }) => {
  
  const getTierColor = (tier) => {
    const t = tier?.toLowerCase();
    switch(t) {
      case 'platinum': return 'text-cyan-300 border-cyan-500 bg-cyan-900/20 shadow-[0_0_15px_rgba(34,211,238,0.3)]';
      case 'gold': return 'text-yellow-400 border-yellow-500 bg-yellow-900/20 shadow-[0_0_15px_rgba(250,204,21,0.3)]';
      case 'silver': return 'text-gray-300 border-gray-400 bg-gray-800/40';
      case 'bronze': return 'text-orange-400 border-orange-600 bg-orange-900/20';
      default: return 'text-gray-500 border-gray-700 bg-gray-900/10';
    }
  };

  const getTierIcon = (tier) => {
    const t = tier?.toLowerCase();
    if (t === 'platinum') return <Crown className="w-5 h-5" />;
    if (t === 'gold' || t === 'silver') return <Star className="w-5 h-5" />;
    return <Medal className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen p-4 pb-24 relative z-10">
      <div className="mb-8 mt-4 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-block mb-4">
           <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl rotate-3 flex items-center justify-center shadow-lg border border-white/20">
              <Award className="w-8 h-8 text-white" />
           </div>
        </motion.div>
        <h1 className="text-3xl font-bold text-white mb-1">Arena Tech</h1>
        <p className="text-gray-400 text-sm">Domine tecnologias e colecione medalhas.</p>
      </div>

      <GlassCard className="p-6 mb-8">
        <label className="text-[10px] font-bold text-purple-300 uppercase tracking-widest mb-3 block">Iniciar Nova Jornada</label>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ex: Python, Docker, AWS..."
            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all"
          />
          <GradientButton onClick={() => onStartGame()} disabled={!topic.trim()} className="px-4 flex items-center justify-center">
            <Play className="w-5 h-5 fill-current" />
          </GradientButton>
        </div>
      </GlassCard>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-white font-bold flex items-center gap-2 text-sm">
            <Trophy className="w-4 h-4 text-yellow-400" /> Suas Conquistas
          </h3>
          <span className="text-xs text-gray-500">{myMasteries.length} tópicos</span>
        </div>
        
        {myMasteries.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-white/5">
            <Medal className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p className="text-gray-400 text-sm">Sua estante de troféus está vazia.</p>
            <p className="text-gray-600 text-xs mt-1">Complete desafios para ganhar medalhas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {myMasteries.map((mastery, idx) => (
              <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
              >
                  <GlassCard 
                    className={`p-4 flex items-center justify-between border cursor-pointer hover:brightness-110 transition-all group ${getTierColor(mastery.tier)}`}
                    onClick={() => onStartGame(mastery.topic)}
                  >
                  <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 bg-black/20 backdrop-blur-sm ${getTierColor(mastery.tier).split(' ')[0]} ${getTierColor(mastery.tier).split(' ')[1]}`}>
                          {getTierIcon(mastery.tier)}
                      </div>
                      <div>
                          <h4 className="font-bold text-white capitalize text-lg leading-tight">{mastery.topic}</h4>
                          <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-black/30 text-white/90 border border-white/10">
                                  {mastery.tier}
                              </span>
                              <span className="text-xs text-white/60">Nível {mastery.level}/10</span>
                          </div>
                      </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                      <Play className="w-4 h-4 text-white fill-current" />
                  </div>
                  </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Navigation />
    </div>
  );
};

export default ArenaLobby;