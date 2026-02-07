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
      <div
        className="rounded-md p-6 h-full"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderLeft: '3px solid #a855f7',
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4" style={{ color: 'var(--accent-gold)' }} />
          <h3
            className="text-sm font-semibold tracking-wide uppercase"
            style={{ color: 'var(--text-primary)' }}
          >
            AI Insights
          </h3>
        </div>
        <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
          Upload a song to see AI-generated insights...
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-md p-6 h-full flex flex-col"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderLeft: '3px solid var(--accent-gold)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-gray-400" />
          <h3
            className="text-sm font-semibold tracking-wide uppercase"
            style={{ color: 'var(--text-primary)' }}
          >
            AI Insights
          </h3>
        </div>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded hover:bg-black/30 transition-all duration-150 hover:scale-105"
          style={{ color: 'var(--text-tertiary)' }}
          title="Copy to clipboard"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Summary */}
      <div className="mb-6 pb-6" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <p
          className="text-[13px] leading-relaxed italic"
          style={{ color: 'var(--text-secondary)' }}
        >
          "{insight.summary}"
        </p>
        <p className="text-[9px] mt-2" style={{ color: 'var(--text-tertiary)' }}>
          AI-generated analysis ✨
        </p>
      </div>

      {/* Metadata */}
      <div className="space-y-4 flex-1">
        {insight.genre && (
          <div className="flex items-start gap-3">
            <Music className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
                Genre
              </p>
              <p className="text-[11px] font-medium mt-0.5" style={{ color: 'var(--text-primary)' }}>
                {insight.genre}
              </p>
            </div>
          </div>
        )}

        {insight.mood && (
          <div className="flex items-start gap-3">
            <Sparkles className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
                Mood
              </p>
              <p className="text-[11px] font-medium mt-0.5" style={{ color: 'var(--text-primary)' }}>
                {insight.mood}
              </p>
            </div>
          </div>
        )}

        {insight.tempo && (
          <div className="flex items-start gap-3">
            <Gauge className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
                Tempo
              </p>
              <p className="text-[11px] font-medium mt-0.5 font-mono-time" style={{ color: 'var(--text-primary)' }}>
                {insight.tempo} BPM
              </p>
            </div>
          </div>
        )}

        {insight.key && (
          <div className="flex items-start gap-3">
            <Key className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
                Key
              </p>
              <p className="text-[11px] font-medium mt-0.5" style={{ color: 'var(--text-primary)' }}>
                {insight.key}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer note */}
      <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <p className="text-[10px] text-center leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
          Powered by AI audio analysis
        </p>
      </div>
    </div>
  );
};
