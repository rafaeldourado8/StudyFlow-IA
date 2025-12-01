// frontend/src/components/tutorial/OnboardingTutorial.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import GradientButton from '../ui/GradientButton';

const OnboardingTutorial = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Verifica se é a primeira vez do usuário
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      setTimeout(() => setIsOpen(true), 1000);
    }
  }, []);

  const steps = [
    {
      title: 'Bem-vindo ao StudyFlow! 🚀',
      description: 'Sua plataforma de estudos com IA. Vamos fazer um tour rápido?',
      highlight: null,
      position: 'center'
    },
    {
      title: 'Dashboard Inteligente',
      description: 'Aqui você vê seu progresso, sequência de dias e próximas tarefas.',
      highlight: 'home',
      position: 'top'
    },
    {
      title: 'Seus Conhecimentos',
      description: 'Adicione e organize tudo que você quer aprender. A IA vai te ajudar!',
      highlight: 'tasks',
      position: 'bottom'
    },
    {
      title: 'Arena de Batalha',
      description: 'Teste seus conhecimentos com a IA em tempo real. Quanto mais você pratica, mais evolui!',
      highlight: 'arena',
      position: 'bottom'
    },
    {
      title: 'Seu Perfil',
      description: 'Personalize seu avatar e acompanhe suas conquistas.',
      highlight: 'profile',
      position: 'bottom'
    },
    {
      title: 'Pronto para começar! ✨',
      description: 'Adicione seu primeiro conhecimento e comece a evoluir!',
      highlight: null,
      position: 'center'
    }
  ];

  const handleClose = () => {
    localStorage.setItem('hasSeenTutorial', 'true');
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  if (!isOpen) return null;

  const step = steps[currentStep];
  const isCenter = step.position === 'center';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center"
      >
        {/* Overlay escuro */}
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={handleSkip}
        />

        {/* Card do tutorial */}
        <motion.div
          key={currentStep}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: -20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`relative z-10 w-full max-w-md mx-4 ${
            isCenter ? 'my-auto' : step.position === 'top' ? 'mt-20' : 'mb-20'
          }`}
        >
          <GlassCard className="p-6 border-purple-500/30">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span className="text-xs font-bold text-purple-400">
                  {currentStep + 1} de {steps.length}
                </span>
              </div>
              <button
                onClick={handleSkip}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo */}
            <h3 className="text-2xl font-bold text-white mb-3">
              {step.title}
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              {step.description}
            </p>

            {/* Progress bar */}
            <div className="w-full h-1 bg-gray-700 rounded-full mb-6 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Botões */}
            <div className="flex gap-3">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Voltar
                </button>
              )}
              <GradientButton
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-2"
              >
                {currentStep === steps.length - 1 ? 'Começar!' : 'Próximo'}
                {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
              </GradientButton>
            </div>

            {/* Skip button */}
            {currentStep < steps.length - 1 && (
              <button
                onClick={handleSkip}
                className="w-full mt-3 text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                Pular tutorial
              </button>
            )}
          </GlassCard>

          {/* Seta indicadora (quando não está no centro) */}
          {!isCenter && step.highlight && (
            <motion.div
              initial={{ opacity: 0, y: step.position === 'top' ? -10 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`absolute left-1/2 -translate-x-1/2 ${
                step.position === 'top' ? '-bottom-8' : '-top-8'
              }`}
            >
              <div className={`w-0 h-0 border-l-8 border-r-8 border-transparent ${
                step.position === 'top' 
                  ? 'border-t-8 border-t-purple-500/30' 
                  : 'border-b-8 border-b-purple-500/30'
              }`} />
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingTutorial;