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
// Color mapping for section types (Grayscale / Subtle)
const SECTION_COLORS: Record<string, string> = {
  intro: 'bg-white/5 border-white/10',
  verse: 'bg-white/5 border-white/10',
  chorus: 'bg-white/10 border-white/20',
  bridge: 'bg-white/5 border-white/10',
  outro: 'bg-white/5 border-white/10',
  drop: 'bg-white/10 border-white/20',
  solo: 'bg-white/10 border-white/20',
  'pre-chorus': 'bg-white/5 border-white/10',
  'post-chorus': 'bg-white/5 border-white/10',
};

export const StructureMarkers = ({
  sections,
  duration,
  currentTime,
  onSectionClick,
  containerWidth,
}: StructureMarkersProps) => {
  if (!sections || sections.length === 0 || containerWidth === 0 || duration <= 0) return null;

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
            className={`absolute top-0 h-full border-l transition-all duration-150 pointer-events-auto cursor-pointer group ${colorClass} ${isActive ? 'opacity-100 border-l-[3px]' : 'opacity-30 hover:opacity-60 border-l-[1px]'
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
            {/* Section label pill */}
            <div
              className={`absolute top-2 left-2 px-2.5 py-1 rounded-md text-[10px] font-semibold whitespace-nowrap transition-all duration-150 ${isActive
                  ? 'bg-white text-slate-900 scale-105 shadow-pro'
                  : 'bg-black/70 text-white backdrop-blur-sm'
                } group-hover:scale-105 group-hover:shadow-pro-lg`}
              style={{ textShadow: isActive ? 'none' : '0 1px 2px rgba(0,0,0,0.8)' }}
            >
              {section.label}
            </div>

            {/* Vertical divider at start of section */}
            <div
              className={`absolute top-0 left-0 w-px h-full ${isActive ? 'opacity-80' : 'opacity-40'
                }`}
              style={{ backgroundColor: 'var(--border-subtle)' }}
            />

            {/* Hover highlight overlay */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-150 pointer-events-none"
              style={{ backgroundColor: 'white' }}
            />
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
