import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export interface DrumPeak {
    time: number;
    intensity: number;
    channel: 'left' | 'right' | 'center';
}

interface DrumVisualizerProps {
    peaks: DrumPeak[];
    currentTime: number;
    isPlaying: boolean;
}

interface ActivePulse {
    id: string;
    channel: 'left' | 'right' | 'center';
    intensity: number;
    startTime: number;
}

export function DrumVisualizer({ peaks, currentTime, isPlaying }: DrumVisualizerProps) {
    const [activePulses, setActivePulses] = useState<ActivePulse[]>([]);

    // Track the last processed time to ensure we don't miss any beats between frames
    const lastTimeRef = useRef(currentTime);

    // Clean up pulses that are done (older than 200ms)
    useEffect(() => {
        const intervalId = setInterval(() => {
            setActivePulses(prev => {
                const now = Date.now();
                // Filter out old pulses
                const next = prev.filter(p => now - p.startTime < 300); // 300ms lifetime for safety
                return next.length !== prev.length ? next : prev;
            });
        }, 50); // Check every 50ms
        return () => clearInterval(intervalId);
    }, []);

    // Main detection loop
    useEffect(() => {
        if (!isPlaying) {
            lastTimeRef.current = currentTime;
            return;
        }

        // Define the window we are checking: [lastTime, currentTime)
        // We only trigger if the beat is in this window.
        // If we sought backward, just reset.
        if (currentTime < lastTimeRef.current) {
            lastTimeRef.current = currentTime;
            return;
        }

        // Find peaks in the window
        // We can optimize this by keeping a ref to the last checked index if peaks are sorted
        // But for < 1000 peaks, a filter is fine for now, or we can just optimize later.
        // Let's assume peaks are sorted by time.

        const newPulses: ActivePulse[] = [];

        // Simple window check
        // We assume peaks are sorted.
        // To avoid iterating all peaks every frame, we could use a binary search or keep an index,
        // but typically a track has 500-2000 drum hits. Iterating is fast enough for now, 
        // but better to be safe.

        // Optimization: find start index
        // const startIndex = peaks.findIndex(p => p.time >= lastTimeRef.current); 
        // ^ This is still O(N).
        // Let's just iterate.

        for (const peak of peaks) {
            if (peak.time >= lastTimeRef.current && peak.time < currentTime) {
                // Trigger!
                // Spawn 3 pulses for maximum impact (Left, Right, Center)
                const timestamp = Date.now();
                const idBase = `${peak.time}-${Math.random()}`;

                newPulses.push(
                    {
                        id: `left-${idBase}`,
                        channel: 'left',
                        intensity: peak.intensity,
                        startTime: timestamp,
                    },
                    {
                        id: `right-${idBase}`,
                        channel: 'right',
                        intensity: peak.intensity,
                        startTime: timestamp,
                    },
                    {
                        id: `center-${idBase}`,
                        channel: 'center',
                        intensity: peak.intensity, // Center can be slightly brighter
                        startTime: timestamp,
                    }
                );
            }
        }

        if (newPulses.length > 0) {
            setActivePulses(prev => [...prev, ...newPulses]);
        }

        lastTimeRef.current = currentTime;
    }, [currentTime, isPlaying, peaks]);


    return (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <AnimatePresence>
                {activePulses.map((pulse) => {
                    const isLeft = pulse.channel === 'left';
                    const isRight = pulse.channel === 'right';
                    const originClass = isLeft
                        ? 'left-0'
                        : isRight
                            ? 'right-0'
                            : 'left-1/2 -translate-x-1/2';

                    // "Explosive" gradient
                    // We can use a whiter, brighter gradient for the hit
                    const gradient = isLeft
                        ? 'radial-gradient(circle at bottom left, rgba(255,255,255,0.8) 0%, rgba(200,200,255,0.4) 30%, rgba(0,0,0,0) 70%)'
                        : isRight
                            ? 'radial-gradient(circle at bottom right, rgba(255,255,255,0.8) 0%, rgba(200,200,255,0.4) 30%, rgba(0,0,0,0) 70%)'
                            : 'radial-gradient(ellipse at bottom center, rgba(255,255,255,0.9) 0%, rgba(200,200,255,0.5) 40%, rgba(0,0,0,0) 80%)';
                    // Center is bigger/brighter "behind cards"

                    return (
                        <motion.div
                            key={pulse.id}
                            className={`absolute bottom-0 ${originClass} w-[50vw] h-[50vh]`}
                            style={{ background: gradient, mixBlendMode: 'overlay' }}
                            initial={{ opacity: 0.8 * pulse.intensity, scale: 0.8 }}
                            animate={{
                                opacity: 0,
                                scale: 1.4,
                                y: -20
                            }}
                            exit={{ opacity: 0 }}
                            transition={{
                                duration: 0.2, // Fast explosion
                                ease: "easeOut"
                            }}
                        />
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
