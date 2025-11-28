import { motion } from 'framer-motion';
import { Crown, CheckCircle, RefreshCw, ArrowRight, Home } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import GradientButton from '../ui/GradientButton';
import Navigation from '../layout/Navigation';

const ArenaResult = ({ roundResult, currentRun, onRetry, onBackToLobby }) => {
  const { passed, xp, update } = roundResult;
  const isTierUp = update?.event?.includes('Tier');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative z-10">
      {passed && <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-purple-400 rounded-full animate-bounce" />
      </div>}

      <motion.div 
          initial={{ scale: 0.5, rotate: -10 }} 
          animate={{ scale: 1, rotate: 0 }} 
          className="mb-8 relative"
      >
        <div className={`absolute inset-0 blur-[60px] opacity-40 rounded-full ${passed ? 'bg-green-500' : 'bg-red-500'}`} />
        
        {isTierUp ? (
          <div className="w-40 h-40 bg-gradient-to-b from-yellow-300 to-yellow-600 rounded-full flex items-center justify-center border-4 border-yellow-100 shadow-[0_0_60px_rgba(234,179,8,0.6)] relative z-10">
            <Crown className="w-20 h-20 text-white drop-shadow-md" />
          </div>
        ) : passed ? (
          <div className="w-32 h-32 bg-gradient-to-b from-green-400 to-green-600 rounded-full flex items-center justify-center border-4 border-green-200 shadow-2xl relative z-10">
              <CheckCircle className="w-16 h-16 text-white" />
          </div>
        ) : (
          <div className="w-32 h-32 bg-gradient-to-b from-red-400 to-red-600 rounded-full flex items-center justify-center border-4 border-red-200 shadow-2xl relative z-10">
              <RefreshCw className="w-16 h-16 text-white" />
          </div>
        )}
      </motion.div>

      <h2 className="text-4xl font-black text-white mb-2 tracking-tight">
        {isTierUp ? 'TIER UP!' : (passed ? 'VITÓRIA!' : 'Não foi dessa vez')}
      </h2>
      
      <p className="text-lg text-gray-300 mb-8 max-w-xs mx-auto">
        {update?.event 
          ? `Você evoluiu para ${update.event}!` 
          : (passed ? `Mandou bem! Você garantiu +${xp} XP.` : "Revise o conteúdo e tente novamente.")
        }
      </p>

      {passed && (
          <GlassCard className="w-full max-w-xs p-4 mb-8 flex items-center justify-between bg-white/5 border-white/10">
              <div className="text-left">
                  <p className="text-xs text-gray-400 uppercase font-bold">Novo Nível</p>
                  <p className="text-2xl font-bold text-white">
                      {update?.new_level || currentRun.level}
                  </p>
              </div>
              <div className="h-8 w-px bg-white/10"></div>
              <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase font-bold">Rank Atual</p>
                  <p className={`text-lg font-bold uppercase ${isTierUp ? 'text-yellow-400' : 'text-white'}`}>
                      {update?.new_tier || currentRun.tier}
                  </p>
              </div>
          </GlassCard>
      )}

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <GradientButton onClick={onRetry} className="w-full py-4 text-lg shadow-xl shadow-purple-900/20 flex items-center justify-center gap-2">
          {passed ? 'Próximo Nível' : 'Tentar Novamente'} <ArrowRight className="w-5 h-5" />
        </GradientButton>
        
        <button onClick={onBackToLobby} className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium border border-white/5 flex items-center justify-center gap-2">
          <Home className="w-4 h-4" /> Voltar ao Lobby
        </button>
      </div>
      <Navigation />
    </div>
  );
};

export default ArenaResult;