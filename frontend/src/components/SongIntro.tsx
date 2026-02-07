import { Play, Music2, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { AudioFile } from '../types/audio';

interface SongIntroProps {
    audioFile: AudioFile;
    onStart: () => void;
}

export const SongIntro = ({ audioFile, onStart }: SongIntroProps) => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans select-none bg-black">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500/5 via-transparent to-transparent opacity-50" />

            <div className="relative z-10 max-w-4xl w-full mx-auto px-8 flex flex-col md:flex-row items-center gap-12">

                {/* Album Art / Visual */}
                <div className="w-64 h-64 md:w-96 md:h-96 rounded-2xl bg-neutral-900 shadow-2xl border border-white/5 flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    {/* Simple Placeholder Art */}
                    <div className="text-center space-y-4">
                        <div className={`w-20 h-20 mx-auto rounded-full bg-white/5 flex items-center justify-center transition-all duration-1000 ${isLoading ? 'animate-pulse' : ''}`}>
                            <Music2 className="w-8 h-8 text-neutral-500" />
                        </div>
                    </div>
                </div>

                {/* Info & Controls */}
                <div className="flex-1 text-center md:text-left space-y-8">
                    <div className="space-y-2">
                        <h2 className="text-sm font-medium text-yellow-500/80 tracking-widest uppercase animate-pulse">
                            {isLoading ? 'Analyzing Audio...' : 'Ready to Mix'}
                        </h2>
                        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tighter">
                            {audioFile.name ? audioFile.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ") : "Neon Dreams"}
                        </h1>
                        <p className="text-xl text-neutral-400 font-light">
                            Original Mix • 124 BPM • A Minor
                        </p>
                    </div>

                    <div className="space-y-6">
                        <p className="text-neutral-500 max-w-md leading-relaxed">
                            Stems prepared and ready for remixing. Contains Vocals, Drums, Bass, Guitar, and Synth layers.
                        </p>

                        {!isLoading ? (
                            <button
                                onClick={onStart}
                                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-neutral-200 transition-all transform hover:scale-105 active:scale-95 animate-in fade-in zoom-in duration-300"
                            >
                                <Play className="w-5 h-5 fill-current" />
                                <span>Enter Studio</span>
                            </button>
                        ) : (
                            <div className="flex items-center gap-3 text-neutral-400 px-8 py-4">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Processing Stems...</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
