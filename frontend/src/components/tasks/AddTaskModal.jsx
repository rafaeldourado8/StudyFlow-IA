import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import GradientButton from '../ui/GradientButton';

const AddTaskModal = ({ isOpen, onClose, onAddTask }) => {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddTask(title.trim());
      setTitle('');
      onClose();
    } catch (error) {
      console.error('Failed to add task:', error);
      // You could add a toast notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleOverlayClick}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          
          {/* Modal */}
          <motion.div
            className="relative z-10 w-full max-w-md"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <GlassCard className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Add New Task</h2>
                <motion.button
                  onClick={onClose}
                  className="p-1 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <label htmlFor="task-title" className="text-sm font-medium text-gray-300">
                    Task Description
                  </label>
                  <textarea
                    id="task-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What do you want to accomplish?"
                    className="w-full h-24 bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
                    autoFocus
                    required
                  />
                  <p className="text-xs text-gray-400">
                    {title.length}/200 characters
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl border border-white/10 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <GradientButton
                    type="submit"
                    disabled={!title.trim() || isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Add Task
                      </>
                    )}
                  </GradientButton>
                </div>
              </form>

              {/* Quick Suggestions */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="text-sm font-medium text-gray-300 mb-3">Quick Suggestions</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Review React hooks',
                    'Study for math exam',
                    'Read AI research paper',
                    'Practice algorithms'
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
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddTaskModal;