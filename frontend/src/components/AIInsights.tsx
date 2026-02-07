import { Sparkles, Music, Gauge, Key } from 'lucide-react';
import type { AIInsight } from '../types/audio';

interface AIInsightsProps {
  insight: AIInsight | null;
}

export const AIInsights = ({ insight }: AIInsightsProps) => {
  if (!insight) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 h-full">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-white">AI Insights</h3>
        </div>
        <p className="text-slate-400 text-sm">
          Upload a song to see AI-generated insights...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-500" />
        <h3 className="text-lg font-semibold text-white">AI Insights</h3>
      </div>

      {/* Summary */}
      <div className="mb-6">
        <p className="text-slate-300 text-sm leading-relaxed italic">
          "{insight.summary}"
        </p>
        <p className="text-xs text-slate-500 mt-2">
          — AI-generated analysis by Evan's magic ✨
        </p>
      </div>

      {/* Metadata */}
      <div className="space-y-3 flex-1">
        {insight.genre && (
          <div className="flex items-start gap-3">
            <Music className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Genre</p>
              <p className="text-sm text-white font-medium">{insight.genre}</p>
            </div>
          </div>
        )}

        {insight.mood && (
          <div className="flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Mood</p>
              <p className="text-sm text-white font-medium">{insight.mood}</p>
            </div>
          </div>
        )}

        {insight.tempo && (
          <div className="flex items-start gap-3">
            <Gauge className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Tempo</p>
              <p className="text-sm text-white font-medium">{insight.tempo} BPM</p>
            </div>
          </div>
        )}

        {insight.key && (
          <div className="flex items-start gap-3">
            <Key className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Key</p>
              <p className="text-sm text-white font-medium">{insight.key}</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer note */}
      <div className="mt-6 pt-4 border-t border-slate-700">
        <p className="text-xs text-slate-500 text-center">
          Blurb about the song pulled from AI...<br />
          Evan gets to figure this out 🎵
        </p>
      </div>
    </div>
  );
};
