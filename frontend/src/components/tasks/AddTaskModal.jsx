import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BrainCircuit, Save, AlertTriangle, Layers, Microscope, LayoutDashboard, Lightbulb } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import GradientButton from '../ui/GradientButton';
import SkeletonLoader from '../ui/SkeletonLoader';
import { aiService } from '../../services/ai';

// Curiosidades para o Loading
const TRIVIA_FACTS = [
  "Você sabia? O termo 'Bug' surgiu quando uma mariposa real ficou presa em um computador Mark II em 1947.",
  "Você sabia? A primeira linguagem de programação de alto nível foi o Plankalkül, criada em 1948.",
  "Você sabia? O Python foi nomeado em homenagem ao grupo de comédia Monty Python, não à cobra.",
  "Você sabia? O primeiro vírus de computador foi criado em 1971 e se chamava 'Creeper'.",
  "Você sabia? Ada Lovelace é considerada a primeira programadora da história, no século 19.",
  "Você sabia? O Linux alimenta 100% dos supercomputadores mais rápidos do mundo.",
  "Você sabia? O conceito de Inteligência Artificial foi formalmente fundado em uma conferência em Dartmouth em 1956.",
];

const AddTaskModal = ({ isOpen, onClose, onAddTask }) => {
  const [title, setTitle] = useState('');
  
  // Estados de controle da UI
  const [mode, setMode] = useState('input'); // 'input' | 'thinking' | 'result'
  
  // Controle de Abas ('initial' | 'deep' | 'patterns' | 'troubleshooting')
  const [activeTab, setActiveTab] = useState('initial');

  // Estado de Loading da Aba Específica
  const [loadingTab, setLoadingTab] = useState(null);
  const [currentTrivia, setCurrentTrivia] = useState("");
  
  // Dados vindos da IA
  const [aiData, setAiData] = useState(null);
  const [extraData, setExtraData] = useState({
    deep: null,
    patterns: null,
    troubleshooting: null
  });

  // 1. Análise Inicial (Obrigatória)
  const handleAnalyze = async () => {
    if (!title.trim()) return;
    setMode('thinking');
    try {
      const data = await aiService.analyzeTask(title, 'initial');
      setAiData(data);
      setMode('result');
      setActiveTab('initial'); // Reseta para a aba inicial
    } catch (error) {
      console.error(error);
      setMode('input');
    }
  };

  // 2. Troca de Abas e Busca de Dados
  const handleTabChange = async (type) => {
    // Se clicou na aba que já está ativa, não faz nada
    if (activeTab === type) return;

    // Se for 'initial', apenas troca, pois já temos os dados
    if (type === 'initial') {
      setActiveTab(type);
      return;
    }

    // Se já temos os dados cacheados localmente, apenas troca
    if (extraData[type]) {
      setActiveTab(type);
      return;
    }

    // Se não temos dados, inicia o loading com trivia
    const randomFact = TRIVIA_FACTS[Math.floor(Math.random() * TRIVIA_FACTS.length)];
    setCurrentTrivia(randomFact);
    setLoadingTab(type);
    setActiveTab(type); // Muda a aba visualmente para mostrar o skeleton nela

    try {
      const data = await aiService.analyzeTask(title, type);
      if (data && !data.error) {
        setExtraData(prev => ({ ...prev, [type]: data }));
      }
    } catch (error) {
      console.error(`Erro ao buscar ${type}:`, error);
      setActiveTab('initial'); // Volta para o início em caso de erro
    } finally {
      setLoadingTab(null);
    }
  };

  // [ATUALIZADO] 3. Salvar Tudo Estruturado
  const handleFinalSave = async () => {
    // Cria um objeto estruturado unindo as partes para o JSONField
    const structuredData = {
      initial: aiData,
      deep: extraData.deep,
      patterns: extraData.patterns,
      troubleshooting: extraData.troubleshooting
    };

    // Cria uma descrição simples para fallback (visualização antiga ou listagem rápida)
    let simpleDescription = "";
    if (aiData) {
      simpleDescription = `${aiData.definition}\n\n${aiData.pain_point}`;
    }

    // Envia Title, Description e o JSON completo
    await onAddTask(title, simpleDescription, structuredData);
    
    // Reset total
    setTitle('');
    setAiData(null);
    setExtraData({ deep: null, patterns: null, troubleshooting: null });
    setMode('input');
    onClose();
  };

  // Componente Interno para o Conteúdo da Aba
  const TabContent = () => {
    // Se esta aba específica estiver carregando
    if (loadingTab === activeTab) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center space-y-6 animate-pulse">
            <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-2">
                <BrainCircuit className="w-8 h-8 text-purple-400 animate-spin-slow" />
            </div>
            <div className="space-y-2 max-w-xs">
                <h4 className="text-purple-300 font-semibold text-lg">Gerando Conhecimento...</h4>
                <div className="h-1 w-full bg-gray-700 rounded overflow-hidden">
                    <motion.div 
                        className="h-full bg-purple-500"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </div>
            </div>
            <GlassCard className="p-4 bg-yellow-500/10 border-yellow-500/30 mt-4">
                <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-1" />
                    <p className="text-sm text-yellow-100 italic text-left">"{currentTrivia}"</p>
                </div>
            </GlassCard>
        </div>
      );
    }

    // Renderização dos conteúdos baseados na aba ativa
    switch (activeTab) {
      case 'initial':
        return (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3 text-sm">
            <ResultBox label="O que é?" text={aiData.definition} color="text-blue-300" />
            <ResultBox label="Origem" text={aiData.origin} color="text-purple-300" />
            <div className="grid grid-cols-2 gap-2">
              <ResultBox label="Resolve" text={aiData.pain_point} color="text-green-300" />
              <ResultBox label="Evitar" text={aiData.when_not_to_use} color="text-red-300" />
            </div>
          </motion.div>
        );
      
      case 'deep':
        return extraData.deep ? (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">Aprofundamento Técnico</h4>
            <ResultBox label="Edge Cases" text={extraData.deep.edge_cases} color="text-white" />
            <ResultBox label="Internals" text={extraData.deep.advanced_detail} color="text-white" />
            <ResultBox label="Exemplo Real" text={extraData.deep.real_example} color="text-gray-300" />
          </motion.div>
        ) : null;

      case 'patterns':
        return extraData.patterns ? (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
            <h4 className="text-xs font-bold text-pink-300 uppercase tracking-wider mb-2">Arquitetura & Padrões</h4>
            <ResultBox label="Design Patterns" text={extraData.patterns.common_patterns} color="text-white" />
            <ResultBox label="Boas Práticas" text={extraData.patterns.best_practices} color="text-green-200" />
            <ResultBox label="Anti-Patterns" text={extraData.patterns.anti_patterns} color="text-red-200" />
          </motion.div>
        ) : null;

      case 'troubleshooting':
        return extraData.troubleshooting ? (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">Dia a Dia & Debug</h4>
            <ResultBox label="Bugs Comuns" text={extraData.troubleshooting.common_bugs} color="text-white" />
            <ResultBox label="Dicas de Debug" text={extraData.troubleshooting.debugging_tips} color="text-white" />
            <ResultBox label="Performance" text={extraData.troubleshooting.performance_impact} color="text-gray-300" />
          </motion.div>
        ) : null;

      default:
        return null;
    }
  };

  // Renderização Principal
  const renderContent = () => {
    if (mode === 'thinking') return <SkeletonLoader title="Analisando conceito..." />;

    if (mode === 'result' && aiData) {
      return (
        <div className="flex flex-col h-full">
          {/* Menu de Abas (Botões no Topo) */}
          <div className="grid grid-cols-4 gap-2 mb-4 flex-shrink-0">
            <TabButton 
                icon={LayoutDashboard} 
                label="Resumo" 
                isActive={activeTab === 'initial'} 
                onClick={() => handleTabChange('initial')} 
            />
            <TabButton 
                icon={Microscope} 
                label="Detalhes" 
                isActive={activeTab === 'deep'} 
                onClick={() => handleTabChange('deep')} 
            />
            <TabButton 
                icon={Layers} 
                label="Patterns" 
                isActive={activeTab === 'patterns'} 
                onClick={() => handleTabChange('patterns')} 
            />
            <TabButton 
                icon={AlertTriangle} 
                label="Debug" 
                isActive={activeTab === 'troubleshooting'} 
                onClick={() => handleTabChange('troubleshooting')} 
            />
          </div>

          {/* Área de Conteúdo (Scrollável apenas aqui) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-20 min-h-[300px]">
            <AnimatePresence mode="wait">
                <TabContent key={activeTab} />
            </AnimatePresence>
          </div>

          {/* Botão Fixo Salvar */}
          <div className="absolute bottom-0 left-0 right-0 p-6 pt-2 bg-gradient-to-t from-[#030014] via-[#030014] to-transparent z-20">
            <GradientButton onClick={handleFinalSave} className="w-full flex items-center justify-center gap-2 shadow-xl">
              <Save className="w-4 h-4" />
              Salvar Tarefa com Contexto
            </GradientButton>
          </div>
        </div>
      );
    }

    // Input Mode
    return (
      <form onSubmit={(e) => { e.preventDefault(); handleAnalyze(); }} className="space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-300">Sobre o que você quer aprender?</label>
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Docker, SOLID, React Hooks..."
            className="w-full h-24 bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
            autoFocus
            required
          />
        </div>
        
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-3 px-4 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors">
            Cancelar
          </button>
          <GradientButton type="submit" disabled={!title.trim()} className="flex-1 flex items-center justify-center gap-2">
            <BrainCircuit className="w-4 h-4" />
            Analisar
          </GradientButton>
        </div>
      </form>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div className="relative z-10 w-full max-w-lg h-[80vh] flex flex-col" initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}>
            <GlassCard className="p-6 flex-1 flex flex-col overflow-hidden relative">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h2 className="text-xl font-bold text-white truncate pr-4">{mode === 'input' ? 'Nova Tarefa Inteligente' : title}</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white p-1 hover:bg-white/10 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              {renderContent()}
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Componente de Botão da Aba
const TabButton = ({ icon: Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`
      flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-200
      ${isActive 
        ? 'bg-purple-600/20 border-purple-500/50 text-white shadow-[0_0_10px_rgba(168,85,247,0.2)]' 
        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200'
      }
    `}
  >
    <Icon className={`w-4 h-4 mb-1 ${isActive ? 'text-purple-400' : ''}`} />
    <span className="text-[10px] font-medium uppercase tracking-wide">{label}</span>
  </button>
);

const ResultBox = ({ label, text, color }) => (
  <div className="bg-white/5 rounded-lg p-3 border border-white/5">
    <h4 className={`font-semibold mb-1 text-xs ${color}`}>{label}</h4>
    <p className="text-gray-300 leading-relaxed">{text}</p>
  </div>
);

export default AddTaskModal;