import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Play, CheckCircle, XCircle, ArrowRight, Award, Zap, BrainCircuit, AlertTriangle, Star, Medal, Crown, RefreshCw, Home } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import GradientButton from '../ui/GradientButton';
import api from '../../services/api';

const Arena = () => {
  const [view, setView] = useState('lobby'); // 'lobby' | 'loading' | 'game' | 'result' | 'error'
  const [topic, setTopic] = useState('');
  const [quizData, setQuizData] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [xpGainedInRound, setXpGainedInRound] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // --- DADOS DO JOGADOR (MASTERY) ---
  const [myMasteries, setMyMasteries] = useState([]);
  const [currentRun, setCurrentRun] = useState(null); 
  const [roundResult, setRoundResult] = useState(null);

  useEffect(() => {
    if (view === 'lobby') {
      fetchUserData();
    }
  }, [view]);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/api/arena/my-mastery/');
      
      // CORREÇÃO CRÍTICA: Suporte a paginação do Django REST Framework
      const dataList = response.data.results || response.data;

      if (Array.isArray(dataList)) {
        setMyMasteries(dataList);
      } else {
        console.warn("Formato de masteries inválido:", response.data);
        setMyMasteries([]);
      }
    } catch (error) {
      console.error("Erro ao carregar masteries:", error);
      setMyMasteries([]);
    }
  };

  // Helper: Cores visuais para cada Tier
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
  }

  const startGame = async (selectedTopic = null) => {
    const topicToPlay = selectedTopic || topic;
    if (!topicToPlay.trim()) return;
    
    setView('loading');
    setErrorMessage('');
    setXpGainedInRound(0);
    
    try {
      const response = await api.post('/api/arena/battle/start/', { topic: topicToPlay });
      
      if (response.data && response.data.questions) {
        setQuizData(response.data);
        setCurrentRun(response.data.player_status);
        setScore(0);
        setCurrentQIndex(0);
        setView('game');
      } else {
        throw new Error("Resposta inválida da Arena.");
      }
    } catch (error) {
      console.error("Erro start:", error);
      setErrorMessage(error.response?.data?.error || "O Game Master está offline. Tente novamente.");
      setView('error');
    }
  };

  const handleAnswer = (index) => {
    if (showFeedback) return;
    setSelectedOption(index);
    setShowFeedback(true);

    if (!quizData?.questions?.[currentQIndex]) return;
    const isCorrect = index === quizData.questions[currentQIndex].correct_index;
    
    if (isCorrect) {
      const points = 100 + (currentRun?.level * 10 || 0);
      setScore(s => s + points);
      setXpGainedInRound(s => s + points);
    }
  };

  const nextQuestion = () => {
    setShowFeedback(false);
    setSelectedOption(null);
    if (currentQIndex + 1 < quizData.questions.length) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      finishRound();
    }
  };

  const finishRound = async () => {
    const passed = xpGainedInRound > 0; 
    
    try {
      const response = await api.post('/api/arena/battle/submit/', { 
        topic: currentRun.topic,
        xp_gained: xpGainedInRound,
        passed: passed
      });
      
      setRoundResult({
        passed,
        xp: xpGainedInRound,
        update: response.data.mastery_update
      });
      setView('result');
    } catch (error) {
      console.error(error);
      setErrorMessage("Erro ao salvar progresso.");
      setView('error');
    }
  };

  // --- RENDERIZAÇÃO ---

  if (view === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Falha na Arena</h2>
        <GlassCard className="p-4 mb-6 bg-red-900/20 border-red-500/30">
            <p className="text-red-200 text-sm">{errorMessage}</p>
        </GlassCard>
        <button onClick={() => setView('lobby')} className="bg-white/10 hover:bg-white/20 text-white py-2 px-6 rounded-xl">
            Voltar ao Lobby
        </button>
      </div>
    );
  }

  if (view === 'lobby') {
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
            <GradientButton onClick={() => startGame()} disabled={!topic.trim()} className="px-4 flex items-center justify-center">
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
                    onClick={() => startGame(mastery.topic)}
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
      </div>
    );
  }

  if (view === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <motion.div 
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mb-8 relative"
        >
          <div className="absolute inset-0 bg-purple-500 blur-xl opacity-40 rounded-full"></div>
          <BrainCircuit className="w-20 h-20 text-purple-400 relative z-10" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">Game Master IA</h2>
        <p className="text-gray-400 max-w-xs mx-auto leading-relaxed">
            Criando desafios sobre <span className="text-purple-300 font-bold">{topic}</span>...
        </p>
      </div>
    );
  }

  if (view === 'game' && currentRun && quizData?.questions) {
    const question = quizData.questions[currentQIndex];
    if (!question) return <div className="p-10 text-center text-white">Erro dados.<button onClick={() => setView('lobby')}>Sair</button></div>;

    const isCorrect = selectedOption === question.correct_index;

    return (
      <div className="min-h-screen p-4 pt-6 pb-32 relative z-10">
        <div className="flex justify-between items-center mb-8">
            <GlassCard className={`px-4 py-1.5 rounded-full border flex items-center gap-2 ${getTierColor(currentRun.tier)}`}>
                {getTierIcon(currentRun.tier)}
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                    {currentRun.tier} <span className="opacity-50">|</span> Lvl {currentRun.level}
                </span>
            </GlassCard>
            
            <div className="flex items-center gap-2 text-purple-300">
                <Zap className="w-4 h-4 fill-current" />
                <span className="text-sm font-bold">{score} XP</span>
            </div>
        </div>

        <div className="flex gap-1.5 mb-8 px-1">
            {quizData.questions.map((_, idx) => (
              <div key={idx} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                idx < currentQIndex ? 'bg-purple-500' : 
                idx === currentQIndex ? 'bg-white animate-pulse' : 'bg-white/10'
              }`} />
            ))}
        </div>

        <motion.div 
            key={question.id || currentQIndex}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="mb-6"
        >
          <h2 className="text-xl font-bold text-white leading-relaxed">{question.text}</h2>
        </motion.div>

        <div className="space-y-3">
          {question.options.map((opt, idx) => {
            let style = "border-white/10 bg-white/5 hover:bg-white/10 active:scale-98";
            
            if (showFeedback) {
              if (idx === question.correct_index) style = "border-green-500 bg-green-500/20 text-green-100";
              else if (idx === selectedOption) style = "border-red-500 bg-red-500/20 text-red-100 opacity-60";
              else style = "opacity-30 border-transparent";
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={showFeedback}
                className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 text-sm md:text-base leading-relaxed flex items-start gap-3 ${style}`}
              >
                <div className={`w-6 h-6 rounded-full border flex-shrink-0 flex items-center justify-center text-xs mt-0.5 ${
                    showFeedback && idx === question.correct_index ? 'border-green-400 text-green-400' : 
                    showFeedback && idx === selectedOption ? 'border-red-400 text-red-400' : 'border-white/20 text-gray-400'
                }`}>
                    {String.fromCharCode(65 + idx)}
                </div>
                {opt}
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {showFeedback && (
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              className={`fixed bottom-0 left-0 right-0 p-6 rounded-t-3xl border-t backdrop-blur-2xl shadow-2xl z-50 ${
                isCorrect ? 'bg-green-950/90 border-green-500/30' : 'bg-red-950/90 border-red-500/30'
              }`}
            >
              <div className="flex gap-4 max-w-md mx-auto">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isCorrect ? 'bg-green-500 text-black' : 'bg-red-500 text-black'}`}>
                    {isCorrect ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                </div>
                <div className="flex-1">
                  <h4 className={`font-bold text-lg ${isCorrect ? 'text-green-200' : 'text-red-200'}`}>
                    {isCorrect ? question.feedback_correct : question.feedback_incorrect}
                  </h4>
                  {!isCorrect && (
                      <div className="mt-2 p-3 rounded-xl bg-black/20 border border-white/5 text-sm text-white/90 leading-relaxed">
                        <span className="font-bold text-red-300 block mb-1 text-xs uppercase">Explicação:</span>
                        {question.explanation}
                      </div>
                  )}
                </div>
              </div>
              <button 
                onClick={nextQuestion} 
                className={`w-full max-w-md mx-auto mt-6 py-3.5 rounded-xl font-bold text-black shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 ${
                    isCorrect ? 'bg-green-400 hover:bg-green-300' : 'bg-white hover:bg-gray-200'
                }`}
              >
                {currentQIndex + 1 === quizData.questions.length ? 'Ver Resultado' : 'Continuar'} <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (view === 'result' && roundResult) {
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
          <GradientButton onClick={() => startGame(currentRun.topic)} className="w-full py-4 text-lg shadow-xl shadow-purple-900/20 flex items-center justify-center gap-2">
            {passed ? 'Próximo Nível' : 'Tentar Novamente'} <ArrowRight className="w-5 h-5" />
          </GradientButton>
          
          <button onClick={() => setView('lobby')} className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium border border-white/5 flex items-center justify-center gap-2">
            <Home className="w-4 h-4" /> Voltar ao Lobby
          </button>
        </div>
      </div>
    );
  }
  
  return null;
};

export default Arena;