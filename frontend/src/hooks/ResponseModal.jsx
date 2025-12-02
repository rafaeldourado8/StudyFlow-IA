import { AnimatePresence, motion } from 'framer-motion';
import GlassCard from './GlassCard';

const ResponseModal = ({ open, onClose, children }) => {
  // positioned above the bottom navbar (which has bottom ~ 8-16px); we use bottom-20
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed left-1/2 -translate-x-1/2 bottom-20 z-50 w-[92vw] max-w-md"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            <GlassCard className="p-4 max-h-[72vh] overflow-auto">
              {children}
            </GlassCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ResponseModal;