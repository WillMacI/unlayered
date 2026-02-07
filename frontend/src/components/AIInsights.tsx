import { Sparkles, Music, Gauge, Key, Copy } from 'lucide-react';
import type { AIInsight } from '../types/audio';

interface AIInsightsProps {
  insight: AIInsight | null;
  title?: string | null;
  artist?: string | null;
  albumName?: string | null;
  albumArtUrl?: string | null;
  artistImageUrl?: string | null;
}

export const AIInsights = ({ insight, title, artist, albumName, albumArtUrl, artistImageUrl }: AIInsightsProps) => {
  const handleCopy = async () => {
    if (!insight) return;

    const sections: string[] = [insight.summary];
    const metadataLines: string[] = [];

    if (insight.genre) metadataLines.push(`Genre: ${insight.genre}`);
    if (insight.mood) metadataLines.push(`Mood: ${insight.mood}`);
    if (insight.tempo !== undefined && insight.tempo !== null) {
      metadataLines.push(`Tempo: ${insight.tempo} BPM`);
    }
    if (insight.key) metadataLines.push(`Key: ${insight.key}`);

    if (metadataLines.length > 0) {
      sections.push(metadataLines.join('\n'));
    }

    const text = sections.join('\n\n');

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
      } catch (error) {
        console.error('Failed to copy AI insight to clipboard:', error);
      }
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
      <div className="p-4 border-b flex items-center justify-between gap-3" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-800 flex-shrink-0">
            {albumArtUrl ? (
              <img src={albumArtUrl} alt="Album art" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-neutral-800" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white truncate">{title || 'Track Insights'}</h3>
            <div className="text-xs text-neutral-400 truncate">{artist || 'Unknown Artist'}</div>
            {albumName && (
              <div className="text-[10px] text-neutral-500 truncate">{albumName}</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {artistImageUrl && (
            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
              <img src={artistImageUrl} alt={artist || 'Artist'} className="w-full h-full object-cover" />
            </div>
          )}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
            title="Copy to clipboard"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Summary Section */}
        <div>
          <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">Analysis</h4>
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

          {insight.tempo !== undefined && insight.tempo !== null && (
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
