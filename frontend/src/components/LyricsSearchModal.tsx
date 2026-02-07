import type { LyricsSearchResult } from '../services/lyricsApi';

interface LyricsSearchModalProps {
  isOpen: boolean;
  query: string;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  results: LyricsSearchResult[];
  onSelect: (result: LyricsSearchResult) => void;
  onClose: () => void;
  isLoading: boolean;
  error?: string | null;
}

export const LyricsSearchModal = ({
  isOpen,
  query,
  onQueryChange,
  onSearch,
  results,
  onSelect,
  onClose,
  isLoading,
  error,
}: LyricsSearchModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-xl border border-white/10 bg-neutral-900 shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h3 className="text-sm font-semibold text-white">Find Track on Genius</h3>
            <p className="text-xs text-neutral-400">Search and select the correct song for lyrics and annotations.</p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors text-sm"
          >
            Close
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              className="flex-1 rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-white/30"
              placeholder="Search for a song or artist..."
            />
            <button
              onClick={onSearch}
              className="px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-neutral-200"
              disabled={isLoading}
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {error && (
            <div className="text-xs text-red-300 bg-red-900/20 border border-red-900/40 px-3 py-2 rounded">
              {error}
            </div>
          )}

          <div className="space-y-2 max-h-[360px] overflow-y-auto">
            {results.length === 0 && !isLoading && (
              <div className="text-sm text-neutral-500 py-6 text-center">No results yet.</div>
            )}
            {results.map((result) => (
              <button
                key={result.id}
                onClick={() => onSelect(result)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left"
              >
                <div className="w-12 h-12 rounded-md overflow-hidden bg-neutral-800 flex items-center justify-center">
                  {result.song_art_image_url || result.header_image_url ? (
                    <img
                      src={result.song_art_image_url || result.header_image_url || ''}
                      alt={`${result.title} art`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-800" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white">{result.title}</div>
                  <div className="text-xs text-neutral-400">{result.artist}</div>
                  {result.album_name && (
                    <div className="text-[10px] text-neutral-500">{result.album_name}</div>
                  )}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-neutral-500">Select</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
