import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';
import AddTaskModal from './AddTaskModal';
import GlassCard from '../ui/GlassCard';
import { useTasks } from '../../hooks/useTasks';

const TaskList = () => {
  const { tasks, toggleTask, deleteTask, addTask } = useTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen p-4 pb-20 relative z-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Conhecimentos</h1>
        <p className="text-gray-400">
          {tasks.filter(t => t.completed).length} de {tasks.length} tópicos dominados
        </p>
      </motion.div>

      {/* Knowledge List (Antiga Task List) */}
      <div className="space-y-2">
        <AnimatePresence>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={toggleTask}
              onDelete={deleteTask}
            />
          ))}
        </AnimatePresence>

        {tasks.length === 0 && (
          <GlassCard className="p-8 text-center">
            <p className="text-gray-400">Seu fluxo de conhecimento está vazio. Adicione um tópico para começar a aprender!</p>
          </GlassCard>
        )}
      </div>

      {/* FAB */}
      <motion.button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-purple-500/25 transition-all duration-300 z-20"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Plus className="w-6 h-6 text-white" />
      </motion.button>

      {/* Add Topic Modal (Antigo Add Task Modal) */}
      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddTask={addTask}
      />
    </div>
  );
};

export default TaskList;