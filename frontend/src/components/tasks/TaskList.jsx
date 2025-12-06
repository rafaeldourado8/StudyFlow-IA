import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, List, Rocket, Map as MapIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TaskCard from './TaskCard';
import AddTaskModal from './AddTaskModal';
import KnowledgeViewerModal from './KnowledgeViewerModal';
import GlassCard from '../ui/GlassCard';
import { useTasks } from '../../hooks/useTasks';

const TaskList = () => {
  const { tasks, toggleTask, deleteTask, addTask } = useTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewMode, setViewMode] = useState('flashcards'); // 'flashcards' | 'journey'
  const navigate = useNavigate();

  const handleStartLevel = (levelId) => {
    navigate('/ai', { state: { mode: 'journey', levelId } });
  };

  return (
    <div className="min-h-screen p-4 pb-24 relative z-10">
      
      {/* --- HEADER COM O SWITCH ESTILIZADO --- */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col gap-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-1">
              {viewMode === 'journey' ? (
                <span className="bg-gradient-to-r from-orange-400 to-purple-500 bg-clip-text text-transparent">
                  Saga do Código
                </span>
              ) : 'Conhecimentos'}
            </h1>
            <p className="text-gray-400 text-sm font-medium">
              {viewMode === 'journey' 
                ? 'Sua trilha para se tornar Arquiteto' 
                : `${tasks.filter(t => t.completed).length} tópicos dominados`}
            </p>
          </div>

          {/* O BOTÃO SWITCH (Foguete) */}
          <div className="relative bg-black/40 backdrop-blur-lg border border-white/10 p-1.5 rounded-full flex items-center gap-1 shadow-2xl">
            {/* Fundo Deslizante com Gradiente Condicional */}
            <motion.div 
              className={`absolute top-1.5 bottom-1.5 w-12 rounded-full shadow-lg z-0 ${
                viewMode === 'journey' 
                  ? 'bg-gradient-to-r from-orange-500 to-purple-600' 
                  : 'bg-gray-700'
              }`}
              animate={{ x: viewMode === 'flashcards' ? 0 : 52 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            />
            
            {/* Botão Flashcards */}
            <button 
              onClick={() => setViewMode('flashcards')}
              className={`relative z-10 w-12 h-9 flex items-center justify-center rounded-full transition-colors duration-300 ${
                viewMode === 'flashcards' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <List className="w-5 h-5" strokeWidth={3} />
            </button>
            
            {/* Botão Jornada (Foguete) */}
            <button 
              onClick={() => setViewMode('journey')}
              className={`relative z-10 w-12 h-9 flex items-center justify-center rounded-full transition-colors duration-300 ${
                viewMode === 'journey' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Rocket className={`w-5 h-5 ${viewMode === 'journey' ? 'fill-current' : ''}`} strokeWidth={3} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* --- ÁREA DE CONTEÚDO --- */}
      <AnimatePresence mode="wait">
        {viewMode === 'flashcards' ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-3"
          >
            {tasks.length === 0 ? (
              <GlassCard className="p-10 text-center border-dashed border-white/10 bg-white/5">
                <p className="text-gray-400">Seu caderno está vazio.</p>
                <p className="text-sm text-gray-500 mt-2">Clique no + para adicionar anotações.</p>
              </GlassCard>
            ) : (
              tasks.map((task) => (
                <div key={task.id} onClick={() => setSelectedTask(task)} className="cursor-pointer">
                  <TaskCard task={task} onToggle={toggleTask} onDelete={deleteTask} />
                </div>
              ))
            )}
            
            {/* FAB (Apenas no modo Flashcards) */}
            <motion.button
              onClick={() => setIsModalOpen(true)}
              className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-900/40 z-30 border border-white/20"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <Plus className="w-6 h-6 text-white" />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="journey"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <JourneyMap onPlayLevel={handleStartLevel} />
          </motion.div>
        )}
      </AnimatePresence>

      <AddTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddTask={addTask} />
      <KnowledgeViewerModal isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} task={selectedTask} />
    </div>
  );
};

export default TaskList;