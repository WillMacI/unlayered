import type { Stem } from '../types/audio';
import { motion } from 'framer-motion';

interface LyricsOverlayProps {
    lyrics: NonNullable<Stem['lyrics']>;
    currentTime: number;
    onLineClick?: (payload: { index: number; line: string; prevLine?: string | null; nextLine?: string | null }) => void;
}

export const LyricsOverlay = ({ lyrics, currentTime, onLineClick }: LyricsOverlayProps) => {
    // Find the active line index
    const activeIndex = lyrics.findIndex(
        (line) => currentTime >= line.startTime && currentTime < line.endTime
    );

    // Refined Logic: Find the line that *should* be in focus.
    let targetIndex = activeIndex;

    if (activeIndex === -1) {
        if (lyrics.length === 0) return null;

        if (currentTime < lyrics[0].startTime) {
            targetIndex = 0;
        } else if (currentTime > lyrics[lyrics.length - 1].endTime) {
            targetIndex = lyrics.length - 1;
        } else {
            // In between lines: Find next one to scroll towards
            const nextIndex = lyrics.findIndex(l => l.startTime > currentTime);
            targetIndex = nextIndex !== -1 ? nextIndex : lyrics.length - 1;
        }
    }

    const activeLine = lyrics[targetIndex];
    const nextLine = targetIndex + 1 < lyrics.length ? lyrics[targetIndex + 1] : null;
    const isActive = activeIndex === targetIndex;

    return (
        <div className="absolute inset-0 z-10 pointer-events-none flex items-center pl-6 bg-gradient-to-r from-black/70 via-black/30 to-transparent">
            <button
                type="button"
                className="flex flex-col gap-0.5 items-start max-w-xl pointer-events-auto cursor-pointer text-left"
                onClick={() =>
                    onLineClick?.({
                        index: targetIndex,
                        line: activeLine.text,
                        prevLine: targetIndex > 0 ? lyrics[targetIndex - 1].text : null,
                        nextLine: nextLine?.text ?? null,
                    })
                }
            >
                <motion.div
                    key={`active-${targetIndex}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                        opacity: isActive ? 1 : 0.6,
                        y: 0,
                        scale: isActive ? 1 : 0.95
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 120,
                        damping: 15,
                        mass: 0.8
                    }}
                    className="font-black leading-none tracking-tight text-white text-xl md:text-2xl drop-shadow-lg"
                >
                    {activeLine.text}
                </motion.div>
                {nextLine && (
                    <motion.div
                        key={`next-${targetIndex + 1}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.3 }}
                        transition={{ duration: 0.3 }}
                        className="font-bold leading-none tracking-tight text-white/40 text-base md:text-lg"
                    >
                        {nextLine.text}
                    </motion.div>
                )}
            </button>
        </div>
    );
};
