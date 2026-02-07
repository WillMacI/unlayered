/**
 * StructureMarkers - Visual section overlays on waveforms
 * Shows verse/chorus/bridge markers that are clickable to jump to sections
 */

import type { SongSection } from '../types/audio';

interface StructureMarkersProps {
  sections: SongSection[];
  duration: number;
  currentTime: number;
  onSectionClick?: (section: SongSection) => void;
  containerWidth: number;
}

// Color mapping for section types
const SECTION_COLORS: Record<string, string> = {
  intro: 'bg-blue-500/20 border-blue-500',
  verse: 'bg-green-500/20 border-green-500',
  chorus: 'bg-purple-500/20 border-purple-500',
  bridge: 'bg-orange-500/20 border-orange-500',
  outro: 'bg-slate-500/20 border-slate-500',
  drop: 'bg-red-500/20 border-red-500',
  solo: 'bg-yellow-500/20 border-yellow-500',
  'pre-chorus': 'bg-cyan-500/20 border-cyan-500',
  'post-chorus': 'bg-pink-500/20 border-pink-500',
};

export const StructureMarkers = ({
  sections,
  duration,
  currentTime,
  onSectionClick,
  containerWidth,
}: StructureMarkersProps) => {
  if (!sections || sections.length === 0 || containerWidth === 0) return null;

  // Find active section
  const activeSection = sections.find(
    (section) => currentTime >= section.startTime && currentTime < section.endTime
  );

  return (
    <div className="absolute inset-0 pointer-events-none">
      {sections.map((section, index) => {
        const leftPercent = (section.startTime / duration) * 100;
        const widthPercent = ((section.endTime - section.startTime) / duration) * 100;
        const isActive = activeSection?.type === section.type && activeSection?.startTime === section.startTime;

        const colorClass = SECTION_COLORS[section.type] || 'bg-slate-500/20 border-slate-500';

        return (
          <div
            key={`${section.type}-${index}`}
            className={`absolute top-0 h-full border-l-2 transition-all pointer-events-auto cursor-pointer ${colorClass} ${
              isActive ? 'opacity-100 border-l-4' : 'opacity-40 hover:opacity-70'
            }`}
            style={{
              left: `${leftPercent}%`,
              width: `${widthPercent}%`,
            }}
            onClick={() => onSectionClick?.(section)}
            title={`${section.label} (${formatTime(section.startTime)} - ${formatTime(
              section.endTime
            )})`}
          >
            {/* Section label */}
            <div
              className={`absolute top-1 left-2 px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-white text-slate-900 scale-110'
                  : 'bg-slate-900/80 text-white'
              }`}
            >
              {section.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Helper to format time as MM:SS
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
