import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BrainCircuit, ArrowRight, Save } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import GradientButton from '../ui/GradientButton';
import SkeletonLoader from '../ui/SkeletonLoader';
import { aiService } from '../../services/ai';

const AddTaskModal = ({ isOpen, onClose, onAddTask }) => {
  const [title, setTitle] = useState('');
  
  // Estados da Máquina: 'input' | 'thinking' | 'result' | 'deep_thinking' | 'deep_result'
  const [mode, setMode] = useState('input'); 
  const [aiData, setAiData] = useState(null);
  const [deepData, setDeepData] = useState(null);

  const handleAnalyze = async () => {
    if (!title.trim()) return;
    setMode('thinking');
    try {
      const data = await aiService.analyzeTask(title, 'initial');
      setAiData(data);
      setMode('result');
    } catch (error) {
      console.error(error);
      setMode('input'); // Volta em caso de erro
    }
  };

  const handleDeepDive = async () => {
    setMode('deep_thinking');
    try {
      const data = await aiService.analyzeTask(title, 'deep');
      setDeepData(data);
      setMode('deep_result');
    } catch (error) {
      console.error(error);
      // Mantém o resultado anterior se falhar o deep dive
      setMode('result'); 
    }
  };

  const handleFinalSave = async () => {
    // Monta uma descrição rica com tudo que foi gerado
    let fullDescription = "";
    
    if (aiData) {
      fullDescription += `📚 **Conceito:** ${aiData.definition}\n`;
      fullDescription += `💡 **Origem:** ${aiData.origin}\n`;
      fullDescription += `💊 **Resolve:** ${aiData.pain_point}\n`;
      fullDescription += `✅ **Quando usar:** ${aiData.when_to_use}\n`;
      fullDescription += `❌ **Evitar:** ${aiData.when_not_to_use}\n`;
    }

    if (deepData) {
      fullDescription += `\n🔍 **Edge Cases:** ${deepData.edge_cases}\n`;
      fullDescription += `🛠️ **Exemplo Real:** ${deepData.real_example}\n`;
    }

    // Chama a função original de adicionar tarefa, mas agora com descrição rica
    // Nota: Seu backend precisa aceitar 'description' no POST /tasks/
    // Se o seu addTask espera apenas (title), você pode concatenar no titulo ou ajustar o hook useTasks
    await onAddTask(title, fullDescription); 
    
    // Reset
    setTitle('');
    setAiData(null);
    setDeepData(null);
    setMode('input');
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderContent = () => {
    switch (mode) {
      case 'thinking':
        return <SkeletonLoader title="Analisando tópico..." />;
      
      case 'deep_thinking':
        return <SkeletonLoader title="Buscando casos extremos e exemplos..." />;

      case 'result':
      case 'deep_result':
        return (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {/* Resultado Inicial */}
            {aiData && (
              <div className="space-y-3 text-sm">
                <ResultBox label="O que é?" text={aiData.definition} color="text-blue-300" />
                <ResultBox label="Origem" text={aiData.origin} color="text-purple-300" />
                <ResultBox label="Dor que resolve" text={aiData.pain_point} color="text-green-300" />
                <div className="grid grid-cols-2 gap-2">
                  <ResultBox label="Quando usar" text={aiData.when_to_use} color="text-teal-300" />
                  <ResultBox label="Quando não usar" text={aiData.when_not_to_use} color="text-red-300" />
                </div>
              </div>
            )}

            {/* Resultado Profundo */}
            {mode === 'deep_result' && deepData && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 pt-4 border-t border-white/10 space-y-3 text-sm"
              >
                <ResultBox label="⚠️ Edge Cases" text={deepData.edge_cases} color="text-amber-300" />
                <ResultBox label="🛠️ Exemplo Real" text={deepData.real_example} color="text-indigo-300" />
              </motion.div>
            )}

            {/* Ações */}
            <div className="pt-4 flex gap-3 sticky bottom-0 bg-[#030014]/80 backdrop-blur-md py-2">
              <button
                type="button"
                onClick={handleFinalSave}
                className="flex-1 py-3 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <Save className="w-4 h-4" />
                Salvar Tarefa
              </button>
              
              {mode === 'result' && (
                <GradientButton
                  onClick={handleDeepDive}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  Saber mais? <ArrowRight className="w-4 h-4" />
                </GradientButton>
              )}
            </div>
          </div>
        );

      default: // 'input'
        return (
          <form onSubmit={(e) => { e.preventDefault(); handleAnalyze(); }} className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300">
                Sobre o que você quer aprender?
              </label>
              <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Docker, SOLID, React Hooks..."
                className="w-full h-24 bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
                autoFocus
                required
              />
              <p className="text-xs text-gray-400">
                {title.length}/200 caracteres
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors border border-white/10"
              >
                Cancelar
              </button>
              <GradientButton type="submit" disabled={!title.trim()} className="flex-1 flex items-center justify-center gap-2">
                <BrainCircuit className="w-4 h-4" />
                Analisar com IA
              </GradientButton>
            </div>
            
             {/* Quick Suggestions */}
             <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="text-sm font-medium text-gray-300 mb-3">Sugestões Rápidas</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Docker Containers',
                    'React Hooks',
                    'SOLID Principles',
                    'Machine Learning Basics'
                  ].map((suggestion) => (
                    <motion.button
                      key={suggestion}
                      type="button"
                      onClick={() => setTitle(suggestion)}
                      className="px-3 py-1.5 text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg border border-purple-500/30 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
              </div>
          </form>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={onClose} 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }} 
          />
          <motion.div 
            className="relative z-10 w-full max-w-lg" 
            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <GlassCard className="p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  {mode === 'input' ? 'Nova Tarefa Inteligente' : title}
                </h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {renderContent()}
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Helper Component para exibir as caixas de resposta
const ResultBox = ({ label, text, color }) => (
  <div className="bg-white/5 rounded-lg p-3 border border-white/5">
    <h4 className={`font-semibold mb-1 ${color}`}>{label}</h4>
    <p className="text-gray-300 leading-relaxed">{text}</p>
  </div>
);

export default AddTaskModal;