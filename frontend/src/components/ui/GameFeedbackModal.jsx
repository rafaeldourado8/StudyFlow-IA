import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, XCircle, ArrowRight, BookOpen } from 'lucide-react';
import GradientButton from './GradientButton'; // Importando do mesmo diretório UI

const GameFeedbackModal = ({ 
  isOpen, 
  onClose, 
  onNext, 
  isCorrect, 
  feedback, 
  explanation,
  isLastQuestion 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop (Fundo Escuro com Blur) */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          {/* O Card do Modal */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", bounce: 0.4 }}
            className={`
              relative w-full max-w-md p-6 rounded-3xl border shadow-2xl overflow-hidden
              ${isCorrect 
                ? 'bg-green-950/90 border-green-500/50 shadow-[0_0_50px_rgba(34,197,94,0.2)]' 
                : 'bg-red-950/90 border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.2)]'
              }
            `}
          >
            {/* Botão de Fechar (X) - Permite fechar para ver o tabuleiro */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/20 text-white/70 hover:text-white hover:bg-black/40 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Conteúdo Principal */}
            <div className="flex items-start gap-4 mb-6 pr-8">
              {/* Ícone de Status */}
              <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                  isCorrect 
                    ? 'bg-green-500 text-black border-green-400' 
                    : 'bg-red-500 text-black border-red-400'
              }`}>
                {isCorrect ? <CheckCircle className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
              </div>
              
              {/* Texto de Feedback */}
              <div className="flex-1">
                <h4 className={`text-xl font-bold mb-1 ${isCorrect ? 'text-green-100' : 'text-red-100'}`}>
                  {isCorrect ? 'Resposta Correta!' : 'Não foi dessa vez...'}
                </h4>
                <p className="text-white/80 text-sm leading-relaxed">
                  {feedback}
                </p>
              </div>
            </div>

            {/* Explicação (Aparece apenas se errou e se houver explicação) */}
            {!isCorrect && explanation && (
              <div className="mb-6 p-4 rounded-xl bg-black/40 border border-white/10 text-sm text-white/90 leading-relaxed">
                <div className="flex items-center gap-2 mb-2 text-red-300 font-bold uppercase text-xs tracking-wide">
                  <BookOpen className="w-4 h-4" />
                  Explicação
                </div>
                {explanation}
              </div>
            )}

            {/* Botão de Ação (Próxima Pergunta) */}
            <GradientButton 
              onClick={onNext} 
              className={`w-full py-4 flex items-center justify-center gap-2 shadow-xl text-lg font-bold ${
                !isCorrect && 'grayscale-[0.3] hover:grayscale-0'
              }`}
            >
              {isLastQuestion ? 'Ver Resultado Final' : 'Próxima Pergunta'} 
              <ArrowRight className="w-5 h-5" />
            </GradientButton>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default GameFeedbackModal;