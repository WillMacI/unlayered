import { Sparkles, Music, Gauge, Key, Copy } from 'lucide-react';
import type { AIInsight } from '../types/audio';

interface AIInsightsProps {
  insight: AIInsight | null;
}

export const AIInsights = ({ insight }: AIInsightsProps) => {
  const handleCopy = () => {
    if (insight) {
      const text = `${insight.summary}\n\nGenre: ${insight.genre}\nMood: ${insight.mood}\nTempo: ${insight.tempo} BPM\nKey: ${insight.key}`;
      navigator.clipboard.writeText(text);
    }
  };

  if (!insight) {
    return (
      <div className="h-full rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-4"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-500">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">No Insights Yet</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-[200px] mx-auto">
            Upload an audio file to generate AI analysis of the track.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full rounded-xl overflow-hidden flex flex-col"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
        <h3 className="text-sm font-bold text-white">Track Insights</h3>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-md hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          title="Copy to clipboard"
        >
          <Copy className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Summary Section */}
        <div>
          <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Analysis</h4>
          <p className="text-sm leading-relaxed text-neutral-300">
            {insight.summary}
          </p>
        </div>

        <div className="h-px w-full bg-white/5" />

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          {insight.genre && (
            <div className="p-3 rounded-lg bg-white/5 space-y-1">
              <div className="flex items-center gap-2 text-neutral-400">
                <Music className="w-3.5 h-3.5" />
                <span className="text-[10px] font-medium uppercase">Genre</span>
              </div>
              <p className="text-sm font-medium text-white">{insight.genre}</p>
            </div>
          )}

          {insight.mood && (
            <div className="p-3 rounded-lg bg-white/5 space-y-1">
              <div className="flex items-center gap-2 text-neutral-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-[10px] font-medium uppercase">Mood</span>
              </div>
              <p className="text-sm font-medium text-white">{insight.mood}</p>
            </div>
          )}

          {insight.tempo && (
            <div className="p-3 rounded-lg bg-white/5 space-y-1">
              <div className="flex items-center gap-2 text-neutral-400">
                <Gauge className="w-3.5 h-3.5" />
                <span className="text-[10px] font-medium uppercase">Tempo</span>
              </div>
              <p className="text-sm font-medium text-white">{insight.tempo} <span className="text-[10px] text-neutral-500">BPM</span></p>
            </div>
          )}

          {insight.key && (
            <div className="p-3 rounded-lg bg-white/5 space-y-1">
              <div className="flex items-center gap-2 text-neutral-400">
                <Key className="w-3.5 h-3.5" />
                <span className="text-[10px] font-medium uppercase">Key</span>
              </div>
              <p className="text-sm font-medium text-white">{insight.key}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
