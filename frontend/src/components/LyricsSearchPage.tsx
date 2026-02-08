import type { LyricsSearchResult } from '../services/lyricsApi';

interface LyricsSearchPageProps {
    query: string;
    onQueryChange: (value: string) => void;
    onSearch: () => void;
    results: LyricsSearchResult[];
    onSelect: (result: LyricsSearchResult) => void;
    isLoading: boolean;
    error?: string | null;
    onBack?: () => void; // Optional back button if user wants to cancel
}

export const LyricsSearchPage = ({
    query,
    onQueryChange,
    onSearch,
    results,
    onSelect,
    isLoading,
    error,
    onBack,
}: LyricsSearchPageProps) => {
    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-gradient-radial from-yellow-900/10 via-transparent to-transparent opacity-30 pointer-events-none" />

            <div className="relative w-full max-w-3xl px-6 flex flex-col gap-8 z-10">
                <div className="text-center space-y-2">
                    <h2 className="text-sm font-medium text-yellow-500/80 tracking-widest uppercase">
                        Step 2 of 3
                    </h2>
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                        Identify Your Track
                    </h1>
                    <p className="text-neutral-400">
                        Select the correct song from Genius to sync lyrics and structure.
                    </p>
                </div>

                <div className="bg-neutral-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-6 shadow-2xl">
                    <div className="flex gap-3 mb-6">
                        <input
                            value={query}
                            onChange={(e) => onQueryChange(e.target.value)}
                            className="flex-1 rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-base text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500/50 transition-all"
                            placeholder="Search for song title or artist..."
                            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                            autoFocus
                        />
                        <button
                            onClick={onSearch}
                            className="px-6 py-3 rounded-xl bg-white text-black font-bold hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-white/10"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Searching...' : 'Search'}
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 text-sm text-red-300 bg-red-900/20 border border-red-900/40 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {results.length === 0 && !isLoading && (
                            <div className="flex flex-col items-center justify-center py-12 text-neutral-500 border-2 border-dashed border-white/5 rounded-xl">
                                <p>No results found</p>
                                <p className="text-xs text-neutral-600 mt-1">Try a different search term</p>
                            </div>
                        )}

                        {results.map((result) => (
                            <button
                                key={result.id}
                                onClick={() => onSelect(result)}
                                className="group w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all duration-200 text-left"
                            >
                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-neutral-800 flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-200">
                                    {result.song_art_image_url || result.header_image_url ? (
                                        <img
                                            src={result.song_art_image_url || result.header_image_url || ''}
                                            alt={`${result.title} art`}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-neutral-600">
                                            <span className="text-xs">No Art</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-base font-bold text-white group-hover:text-yellow-400 transition-colors truncate">
                                        {result.title}
                                    </div>
                                    <div className="text-sm text-neutral-400">{result.artist}</div>
                                    {result.album_name && (
                                        <div className="text-xs text-neutral-600 mt-0.5 truncate">{result.album_name}</div>
                                    )}
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <span className="px-3 py-1.5 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-bold border border-yellow-500/20">
                                        Select
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {onBack && (
                    <button
                        onClick={onBack}
                        className="text-neutral-500 hover:text-white transition-colors text-sm font-medium self-center"
                    >
                        Cancel and go back
                    </button>
                )}
            </div>
        </div>
    );
};
