/**
 * KeyboardShortcutsModal - Help modal showing all available shortcuts
 * Triggered with ? key
 */

import type { KeyboardShortcut } from '../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsModalProps {
  shortcuts: KeyboardShortcut[];
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal = ({
  shortcuts,
  isOpen,
  onClose,
}: KeyboardShortcutsModalProps) => {
  if (!isOpen) return null;

  // Group shortcuts by category
  const playbackShortcuts = shortcuts.filter((s) =>
    ['Play/Pause', 'Seek -5s', 'Seek +5s'].includes(s.description)
  );

  const stemShortcuts = shortcuts.filter((s) =>
    s.description.includes('Toggle') || s.description.includes('Mute') || s.description.includes('Solo')
  );

  const volumeShortcuts = shortcuts.filter((s) =>
    s.description.includes('Volume')
  );

  const formatKey = (shortcut: KeyboardShortcut): string => {
    const parts: string[] = [];

    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.alt) parts.push('Alt');
    if (shortcut.shift) parts.push('Shift');

    // Format special keys
    let key = shortcut.key;
    if (key === ' ') key = 'Space';
    if (key === 'ArrowLeft') key = '←';
    if (key === 'ArrowRight') key = '→';
    if (key === 'ArrowUp') key = '↑';
    if (key === 'ArrowDown') key = '↓';

    parts.push(key);

    return parts.join(' + ');
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 border border-slate-700 rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6">
          {/* Playback */}
          {playbackShortcuts.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">
                Playback
              </h3>
              <div className="space-y-2">
                {playbackShortcuts.map((shortcut, index) => (
                  <ShortcutRow key={index} shortcut={shortcut} formatKey={formatKey} />
                ))}
              </div>
            </div>
          )}

          {/* Stems */}
          {stemShortcuts.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">
                Stems
              </h3>
              <div className="space-y-2">
                {stemShortcuts.map((shortcut, index) => (
                  <ShortcutRow key={index} shortcut={shortcut} formatKey={formatKey} />
                ))}
              </div>
            </div>
          )}

          {/* Volume */}
          {volumeShortcuts.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">
                Volume
              </h3>
              <div className="space-y-2">
                {volumeShortcuts.map((shortcut, index) => (
                  <ShortcutRow key={index} shortcut={shortcut} formatKey={formatKey} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700 bg-slate-800/50">
          <p className="text-xs text-slate-500 text-center">
            Press <kbd className="px-2 py-1 bg-slate-700 rounded text-slate-300">?</kbd>{' '}
            to toggle this help modal
          </p>
        </div>
      </div>
    </div>
  );
};

// Helper component for shortcut row
const ShortcutRow = ({
  shortcut,
  formatKey,
}: {
  shortcut: KeyboardShortcut;
  formatKey: (s: KeyboardShortcut) => string;
}) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-slate-300">{shortcut.description}</span>
    <kbd className="px-3 py-1 bg-slate-700 rounded text-sm font-mono text-slate-200">
      {formatKey(shortcut)}
    </kbd>
  </div>
);
