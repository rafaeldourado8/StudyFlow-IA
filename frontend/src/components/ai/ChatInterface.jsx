import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, BrainCircuit, AlertTriangle, Star, Medal, Crown } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import api from '../../services/api';
import Navigation from '../layout/Navigation';

// IMPORTS ATUALIZADOS: Componentes estão na mesma pasta ('./')
import ArenaLobby from './ArenaLobby';
import ArenaResult from './ArenaResult';
// Modal continua em UI
import GameFeedbackModal from '../ui/GameFeedbackModal'; 

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
  
  // Dados do Jogador
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
      const dataList = response.data.results || response.data;
      setMyMasteries(Array.isArray(dataList) ? dataList : []);
    } catch (error) {
      console.error("Erro ao carregar masteries:", error);
      setMyMasteries([]);
    }
  };

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

  // Funções Auxiliares para o Header do Jogo (Mantido aqui pois é pequeno)
  const getTierColor = (tier) => {
    const t = tier?.toLowerCase();
    if(t === 'platinum') return 'text-cyan-300 border-cyan-500 bg-cyan-900/20 shadow-[0_0_15px_rgba(34,211,238,0.3)]';
    if(t === 'gold') return 'text-yellow-400 border-yellow-500 bg-yellow-900/20 shadow-[0_0_15px_rgba(250,204,21,0.3)]';
    return 'text-gray-500 border-gray-700 bg-gray-900/10';
  };

  const getTierIcon = (tier) => {
    const t = tier?.toLowerCase();
    if (t === 'platinum') return <Crown className="w-5 h-5" />;
    if (t === 'gold' || t === 'silver') return <Star className="w-5 h-5" />;
    return <Medal className="w-5 h-5" />;
  }

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
        <Navigation />
      </div>
    );
  }

  if (view === 'lobby') {
    return (
      <ArenaLobby 
        myMasteries={myMasteries} 
        topic={topic} 
        setTopic={setTopic} 
        onStartGame={startGame} 
      />
    );
  }

  if (view === 'result' && roundResult) {
    return (
      <ArenaResult 
        roundResult={roundResult} 
        currentRun={currentRun} 
        onRetry={() => startGame(currentRun.topic)} 
        onBackToLobby={() => setView('lobby')} 
      />
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

  // --- GAME VIEW ---
  if (view === 'game' && currentRun && quizData?.questions) {
    const question = quizData.questions[currentQIndex];
    if (!question) return <div className="p-10 text-center text-white">Erro dados.<button onClick={() => setView('lobby')}>Sair</button></div>;

    return (
      <div className="min-h-screen p-4 pt-6 pb-32 relative z-10">
        {/* Header do Jogo */}
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

        {/* Barra de Progresso */}
        <div className="flex gap-1.5 mb-8 px-1">
            {quizData.questions.map((_, idx) => (
              <div key={idx} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                idx < currentQIndex ? 'bg-purple-500' : 
                idx === currentQIndex ? 'bg-white animate-pulse' : 'bg-white/10'
              }`} />
            ))}
        </div>

        {/* Pergunta */}
        <motion.div 
            key={question.id || currentQIndex}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="mb-6"
        >
          <h2 className="text-xl font-bold text-white leading-relaxed">{question.text}</h2>
        </motion.div>

        {/* Opções */}
        <div className="space-y-3">
          {question.options.map((opt, idx) => {
            let style = "border-white/10 bg-white/5 hover:bg-white/10 active:scale-98";
            
            // Visual feedback imediato no botão (opcional, já que teremos o modal)
            if (showFeedback) {
              if (idx === question.correct_index) style = "border-green-500/50 bg-green-500/10";
              else if (idx === selectedOption) style = "border-red-500/50 bg-red-500/10 opacity-50";
              else style = "opacity-30 border-transparent";
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={showFeedback}
                className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 text-sm md:text-base leading-relaxed flex items-start gap-3 ${style}`}
              >
                <div className="w-6 h-6 rounded-full border border-white/20 flex-shrink-0 flex items-center justify-center text-xs mt-0.5 text-gray-400">
                    {String.fromCharCode(65 + idx)}
                </div>
                {opt}
              </button>
            );
          })}
        </div>

        {/* --- NOVO COMPONENTE DE POPUP --- */}
        <GameFeedbackModal
          isOpen={showFeedback}
          onClose={() => setShowFeedback(false)}
          onNext={nextQuestion}
          isCorrect={selectedOption === question.correct_index}
          feedback={selectedOption === question.correct_index ? question.feedback_correct : question.feedback_incorrect}
          explanation={question.explanation}
          isLastQuestion={currentQIndex + 1 === quizData.questions.length}
        />
      </div>
    );
  }
  
  return null;
};

export default Arena;