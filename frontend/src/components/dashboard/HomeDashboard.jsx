import { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Target, 
  Zap, 
  BrainCircuit, 
  TrendingUp, 
  Calendar,
  ArrowRight 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTasks } from '../../hooks/useTasks';
import GlassCard from '../ui/GlassCard';
import GradientButton from '../ui/GradientButton';

const HomeDashboard = () => {
  const { user } = useAuth();
  const { tasks } = useTasks();
  const navigate = useNavigate();
  const [streak, setStreak] = useState(0);

  // --- LÓGICA DE STREAK (FRONTEND ONLY) ---
  useEffect(() => {
    const calculateStreak = () => {
      const today = new Date().toDateString();
      const lastLogin = localStorage.getItem('last_login_date');
      let currentStreak = parseInt(localStorage.getItem('user_streak') || '0');

      if (lastLogin !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastLogin === yesterday.toDateString()) {
          // Logou ontem, continua a sequência
          currentStreak += 1;
        } else {
          // Quebrou a sequência ou é o primeiro login
          currentStreak = 1; 
        }
        
        // Salva os novos dados
        localStorage.setItem('last_login_date', today);
        localStorage.setItem('user_streak', currentStreak.toString());
      }
      
      setStreak(currentStreak);
    };

    calculateStreak();
  }, []);

  // Cálculos rápidos baseados nas tarefas
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const nextTask = tasks.find(t => !t.completed); 
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
    
    return { total, completed, nextTask, progress };
  }, [tasks]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen p-4 pb-24 relative z-10">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* 1. HEADER: Saudação e Streak Funcional */}
        <motion.div variants={itemVariants} className="flex justify-between items-end">
          <div>
            <p className="text-gray-400 text-sm mb-1">{greeting}, {user?.name || 'Estudante'}</p>
            <h1 className="text-3xl font-bold text-white">
              Vamos <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">evoluir?</span>
            </h1>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 text-yellow-400 font-bold bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/20">
              <Zap className="w-4 h-4 fill-current" />
              <span>{streak} Dias</span> {/* Agora mostra o valor real */}
            </div>
            <span className="text-[10px] text-gray-500 mt-1">Sequência Atual</span>
          </div>
        </motion.div>

        {/* ... (Restante do componente igual ao original) ... */}
        
        {/* 2. MAIN CARD: Foco Atual */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Target className="w-24 h-24 text-purple-500" />
            </div>
            
            <h2 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
              Sua Prioridade
            </h2>
            
            {stats.nextTask ? (
              <>
                <h3 className="text-2xl font-bold text-white mb-2 line-clamp-2">
                  {stats.nextTask.title}
                </h3>
                <p className="text-gray-400 text-sm mb-6 line-clamp-2">
                  Continue de onde parou para manter seu fluxo de aprendizado.
                </p>
                <div className="flex gap-3">
                  <GradientButton onClick={() => navigate('/ai')} className="flex-1 flex items-center justify-center gap-2">
                    <BrainCircuit className="w-4 h-4" /> Estudar com IA
                  </GradientButton>
                  <button 
                    onClick={() => navigate('/tasks')}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-white font-medium mb-2">Tudo limpo por aqui! 🎉</p>
                <button 
                  onClick={() => navigate('/tasks')} 
                  className="text-purple-400 text-sm font-bold hover:underline"
                >
                  + Adicionar novo objetivo
                </button>
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* 3. METRICS GRID */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
          <GlassCard className="p-4 flex flex-col justify-between h-32">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 mb-2">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white">{stats.progress}%</span>
              <p className="text-xs text-gray-400">Domínio Total</p>
            </div>
            <div className="w-full h-1 bg-gray-700 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-green-500" style={{ width: `${stats.progress}%` }} />
            </div>
          </GlassCard>

          <GlassCard 
            className="p-4 flex flex-col justify-between h-32 cursor-pointer hover:border-purple-500/50 transition-colors"
            onClick={() => navigate('/ai')}
          >
            <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400 mb-2">
              <Play className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-white">Batalha Rápida</span>
              <p className="text-xs text-gray-400">Testar conhecimento</p>
            </div>
          </GlassCard>
        </motion.div>

        {/* 4. WEEKLY ACTIVITY */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" /> Atividade Semanal
              </h3>
              <span className="text-xs text-green-400 font-bold flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" /> +12% XP
              </span>
            </div>
            
            <div className="flex justify-between items-end h-24 gap-2">
              {[40, 70, 30, 85, 50, 90, 20].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end gap-2 group">
                  <div 
                    className="w-full bg-purple-500/20 rounded-t-sm group-hover:bg-purple-500/40 transition-all relative"
                    style={{ height: `${height}%` }}
                  >
                  </div>
                  <span className="text-[10px] text-center text-gray-500">
                    {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'][i]}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default HomeDashboard;