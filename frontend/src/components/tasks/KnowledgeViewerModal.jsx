import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LayoutDashboard, Microscope, Layers, AlertTriangle, BookOpen } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { useUI } from '../../hooks/useUI'; // <--- Importação adicionada

const KnowledgeViewerModal = ({ isOpen, onClose, task }) => {
  const [activeTab, setActiveTab] = useState('initial');
  const { hideNavbar, showNavbar } = useUI(); // <--- Hook do Contexto de UI

  // Efeito para esconder a Navbar quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      hideNavbar();
    } else {
      showNavbar();
    }

    // Cleanup: Garante que a navbar volta se o componente desmontar
    return () => showNavbar();
  }, [isOpen, hideNavbar, showNavbar]);
  
  if (!isOpen || !task) return null;

  // Garante que existe o objeto
  const data = task.ai_metadata || {};
  const hasData = data.initial || data.deep || data.patterns;

  const TabButton = ({ icon: Icon, label, id }) => {
    const isActive = activeTab === id;
    const isDisabled = !data[id]; // Desabilita se não tiver dados salvos para essa aba
    
    return (
      <button
        onClick={() => !isDisabled && setActiveTab(id)}
        disabled={isDisabled}
        className={`
          flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-200
          ${isActive 
            ? 'bg-purple-600/20 border-purple-500/50 text-white shadow-[0_0_10px_rgba(168,85,247,0.2)]' 
            : isDisabled
              ? 'opacity-30 cursor-not-allowed border-transparent'
              : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200'
          }
        `}
      >
        <Icon className={`w-4 h-4 mb-1 ${isActive ? 'text-purple-400' : ''}`} />
        <span className="text-[10px] font-medium uppercase tracking-wide">{label}</span>
      </button>
    );
  };

  const ResultBox = ({ label, text, color }) => (
    <div className="bg-white/5 rounded-lg p-3 border border-white/5 mb-3">
      <h4 className={`font-semibold mb-1 text-xs ${color}`}>{label}</h4>
      <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{text || "N/A"}</p>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'initial':
        return data.initial ? (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
            <ResultBox label="Conceito" text={data.initial.definition} color="text-blue-300" />
            <ResultBox label="Origem" text={data.initial.origin} color="text-purple-300" />
            <div className="grid grid-cols-2 gap-2">
              <ResultBox label="Resolve" text={data.initial.pain_point} color="text-green-300" />
              <ResultBox label="Evitar" text={data.initial.when_not_to_use} color="text-red-300" />
            </div>
          </motion.div>
        ) : <p className="text-gray-500 text-center mt-10">Dados estruturados não disponíveis.</p>;

      case 'deep':
        return (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
            <ResultBox label="Edge Cases" text={data.deep?.edge_cases} color="text-indigo-300" />
            <ResultBox label="Internals" text={data.deep?.advanced_detail} color="text-pink-300" />
            <ResultBox label="Exemplo Real" text={data.deep?.real_example} color="text-gray-300" />
          </motion.div>
        );

      case 'patterns':
        return (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
            <ResultBox label="Patterns" text={data.patterns?.common_patterns} color="text-yellow-300" />
            <ResultBox label="Boas Práticas" text={data.patterns?.best_practices} color="text-green-300" />
            <ResultBox label="Anti-Patterns" text={data.patterns?.anti_patterns} color="text-red-300" />
          </motion.div>
        );

      case 'troubleshooting':
        return (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
            <ResultBox label="Bugs Comuns" text={data.troubleshooting?.common_bugs} color="text-orange-300" />
            <ResultBox label="Debug" text={data.troubleshooting?.debugging_tips} color="text-cyan-300" />
          </motion.div>
        );
        
      default: return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            onClick={onClose}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
          />
          
          <motion.div 
            className="relative z-10 w-full max-w-lg h-[80vh] flex flex-col"
            initial={{ scale: 0.95, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
          >
            <GlassCard className="flex-1 flex flex-col overflow-hidden relative border-purple-500/30">
              
              {/* Header */}
              <div className="p-6 pb-2 flex-shrink-0">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white leading-tight">{task.title}</h2>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> Flashcard de Estudo
                    </p>
                  </div>
                  <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
                    <X className="w-5 h-5 text-gray-300" />
                  </button>
                </div>

                {hasData ? (
                  <div className="grid grid-cols-4 gap-2">
                    <TabButton icon={LayoutDashboard} label="Resumo" id="initial" />
                    <TabButton icon={Microscope} label="Deep" id="deep" />
                    <TabButton icon={Layers} label="Patterns" id="patterns" />
                    <TabButton icon={AlertTriangle} label="Debug" id="troubleshooting" />
                  </div>
                ) : (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-200/70 text-xs">
                    Dados estruturados indisponíveis. Mostrando descrição simples.
                  </div>
                )}
              </div>

              {/* Conteúdo */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-2">
                {hasData ? renderContent() : (
                  <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {task.description || "Sem descrição disponível."}
                  </p>
                )}
              </div>

            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default KnowledgeViewerModal;