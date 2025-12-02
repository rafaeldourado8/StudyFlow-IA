import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import GradientButton from '../ui/GradientButton';
import { useAuth } from '../../hooks/useAuth';

const STORAGE_KEY = 'studyflow:onboarding:v1';

const OnboardingTutorial = () => {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // only trigger when user is authenticated
    if (!isAuthenticated) return;
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) setTimeout(() => setOpen(true), 700);
  }, [isAuthenticated]);

  const steps = [
    { title: 'Bem-vindo ao StudyFlow!', description: 'Tour rápido para você começar.' },
    { title: 'Dashboard', description: 'Veja progresso e próximas tarefas.' },
    { title: 'Conhecimentos', description: 'Adicione e organize seus tópicos.' },
    { title: 'Arena', description: 'Pratique com a IA e evolua.' },
    { title: 'Perfil', description: 'Personalize e veja conquistas.' }
  ];

  const close = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setOpen(false);
  };

  const next = () => {
    if (step < steps.length - 1) setStep(s => s + 1);
    else close();
  };

  const prev = () => {
    if (step > 0) setStep(s => s - 1);
  };

  if (!open) return null;

  const s = steps[step];

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[100] flex items-center justify-center">
        <motion.div
          className="absolute inset-0 bg-black/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="relative z-10 w-full max-w-md mx-4"
        >
          <GlassCard className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span className="text-xs font-bold text-purple-400">
                  {step + 1} / {steps.length}
                </span>
              </div>
              <button onClick={close} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">{s.title}</h3>
            <p className="text-gray-300 mb-6">{s.description}</p>

            <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden mb-4">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.25 }}
              />
            </div>

            <div className="flex gap-3">
              {step > 0 && (
                <button onClick={prev} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white">
                  <ChevronLeft className="w-4 h-4 inline-block mr-2" /> Voltar
                </button>
              )}
              <GradientButton onClick={next} className="flex-1">
                {step === steps.length - 1 ? 'Começar' : 'Próximo'} <ChevronRight className="w-4 h-4 ml-2" />
              </GradientButton>
            </div>

            {step < steps.length - 1 && (
              <button onClick={close} className="w-full mt-3 text-xs text-gray-400">
                Pular tutorial
              </button>
            )}
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingTutorial;