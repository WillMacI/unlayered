import { AnimatePresence, motion } from 'framer-motion';

interface LyricDetailModalProps {
  isOpen: boolean;
  line: string;
  prevLine?: string | null;
  nextLine?: string | null;
  annotations: string[];
  onClose: () => void;
}

export const LyricDetailModal = ({
  isOpen,
  line,
  prevLine,
  nextLine,
  annotations,
  onClose,
}: LyricDetailModalProps) => {
  const lineKey = `${line}-${prevLine ?? ''}-${nextLine ?? ''}`;
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-2xl rounded-xl border border-white/10 bg-neutral-900 shadow-2xl p-6"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Lyric Detail</h3>
              <button
                onClick={onClose}
                className="text-neutral-400 hover:text-white transition-colors text-sm"
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={lineKey}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="space-y-2"
                >
                  {prevLine && (
                    <p className="text-sm text-neutral-500">{prevLine}</p>
                  )}

                  <p className="text-lg font-semibold text-white">{line}</p>

                  {nextLine && (
                    <p className="text-sm text-neutral-500">{nextLine}</p>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="h-px w-full bg-white/10" />

              {annotations.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${lineKey}-annotations`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3"
                    >
                      {annotations.map((ann, idx) => (
                        <motion.p
                          key={`${idx}-${ann.slice(0, 8)}`}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.2, delay: idx * 0.03 }}
                          className="text-sm text-neutral-300 leading-relaxed"
                        >
                          {ann}
                        </motion.p>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.p
                    key={`${lineKey}-empty`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm text-neutral-400"
                  >
                    No annotation for this line.
                  </motion.p>
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
