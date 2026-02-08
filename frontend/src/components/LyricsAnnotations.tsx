import type { TimedLyricAnnotation } from '../types/audio';
import { AnimatePresence, motion } from 'framer-motion';

interface LyricsAnnotationsProps {
  timedLyrics: TimedLyricAnnotation[];
  currentTime: number;
}

export const LyricsAnnotations = ({ timedLyrics, currentTime }: LyricsAnnotationsProps) => {
  if (!timedLyrics || timedLyrics.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Lyrics Annotations</h4>
        <p className="text-sm text-neutral-400 mt-2">No annotations available.</p>
      </div>
    );
  }

  const hasTiming = timedLyrics.some((line) => line.startTime !== null && line.endTime !== null);
  if (!hasTiming) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Lyrics Annotations</h4>
        <p className="text-sm text-neutral-400 mt-2">No synced lyrics available for this track.</p>
      </div>
    );
  }

  const activeIndex = timedLyrics.findIndex(
    (line) =>
      line.startTime !== null &&
      line.endTime !== null &&
      currentTime >= line.startTime &&
      currentTime < line.endTime
  );

  let targetIndex = activeIndex;
  if (activeIndex === -1) {
    const firstTimedIndex = timedLyrics.findIndex((line) => line.startTime !== null);
    if (firstTimedIndex === -1) return null;

    const first = timedLyrics[firstTimedIndex];
    const last = timedLyrics[timedLyrics.length - 1];
    if (first.startTime !== null && currentTime < first.startTime) {
      targetIndex = firstTimedIndex;
    } else if (last.endTime !== null && currentTime > last.endTime) {
      targetIndex = timedLyrics.length - 1;
    } else {
      const nextIndex = timedLyrics.findIndex(
        (line) => line.startTime !== null && (line.startTime ?? 0) > currentTime
      );
      targetIndex = nextIndex !== -1 ? nextIndex : timedLyrics.length - 1;
    }
  }

  const activeLine = timedLyrics[targetIndex];
  const activeKey = `${targetIndex}-${activeLine?.line ?? ''}`;

  return (
    <div className="rounded-xl border border-white/10 bg-neutral-900/80 backdrop-blur-md p-4 h-[280px] flex flex-col gap-3 shadow-xl relative z-20">
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Lyrics Annotations</h4>
        <AnimatePresence mode="wait">
          <motion.p
            key={activeKey}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="text-sm text-white mt-2 font-semibold"
          >
            {activeLine.line}
          </motion.p>
        </AnimatePresence>
      </div>
      {activeLine.annotations.length > 0 ? (
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeKey}-annotations`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {activeLine.annotations.map((ann, idx) => (
                <motion.p
                  key={`${idx}-${ann.slice(0, 10)}`}
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
            key={`${activeKey}-empty`}
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
  );
};
