/**
 * Artist Image Service - Fetch artist images from external APIs
 * Falls back gracefully when APIs are unavailable
 */

export interface ArtistImageResult {
  imageUrl: string;
  source: 'spotify' | 'musicbrainz' | 'placeholder';
}

/**
 * Generate a deterministic gradient placeholder based on artist name
 */
export function generatePlaceholderGradient(artistName: string): string {
  const hash1 = artistName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const hue1 = (hash1 * 37) % 360;
  const hue2 = (hash1 * 73) % 360;

  return `linear-gradient(135deg, hsl(${hue1}, 70%, 50%), hsl(${hue2}, 70%, 40%))`;
}

/**
 * Fetch artist image from MusicBrainz (free, no API key needed)
 */
async function fetchFromMusicBrainz(artistName: string): Promise<string | null> {
  try {
    // Search for artist
    const searchUrl = `https://musicbrainz.org/ws/2/artist/?query=${encodeURIComponent(
      artistName
    )}&fmt=json&limit=1`;

    const searchResponse = await fetch(searchUrl);

    if (!searchResponse.ok) return null;

    const searchData = await searchResponse.json();
    if (!searchData.artists || searchData.artists.length === 0) return null;

    const artistId = searchData.artists[0].id;

    // Try to find an artist image via MusicBrainz URL relations
    const artistUrl = `https://musicbrainz.org/ws/2/artist/${artistId}?inc=url-rels&fmt=json`;
    const artistResponse = await fetch(artistUrl);

    if (!artistResponse.ok) return null;

    const artistData = await artistResponse.json();
    const relations = artistData.relations ?? [];
    const imageRel = relations.find((rel: { type?: string; url?: { resource?: string } }) =>
      rel.type === 'image' && rel.url?.resource
    );

    if (!imageRel?.url?.resource) return null;

    const resourceUrl = imageRel.url.resource;
    if (resourceUrl.includes('commons.wikimedia.org/wiki/File:')) {
      const filename = resourceUrl.split('File:')[1];
      if (filename) {
        return `https://commons.wikimedia.org/wiki/Special:FilePath/${filename}`;
      }
    }

    return resourceUrl;
  } catch (error) {
    console.warn('MusicBrainz fetch failed:', error);
    return null;
  }
}

/**
 * Fetch artist image from Spotify (requires API key)
 */
async function fetchFromSpotify(_artistName: string): Promise<string | null> {
  void _artistName;
  // Note: Requires Spotify API credentials to be configured
  // For now, this is a placeholder that returns null
  // In production, implement OAuth flow and search

  try {
    // TODO: Implement Spotify API integration
    // 1. Get access token via Client Credentials flow
    // 2. Search for artist with _artistName
    // 3. Return first image from artist.images array
    return null;
  } catch (error) {
    console.warn('Spotify fetch failed:', error);
    return null;
  }
}

/**
 * Main function to fetch artist image with fallback strategy
 */
export async function fetchArtistImage(
  artistName: string
): Promise<ArtistImageResult> {
  // Try Spotify first (if configured)
  const spotifyImage = await fetchFromSpotify(artistName);
  if (spotifyImage) {
    return { imageUrl: spotifyImage, source: 'spotify' };
  }

  // Fallback to MusicBrainz (free)
  const musicBrainzImage = await fetchFromMusicBrainz(artistName);
  if (musicBrainzImage) {
    return { imageUrl: musicBrainzImage, source: 'musicbrainz' };
  }

  // Final fallback: generated gradient
  const placeholder = generatePlaceholderGradient(artistName);
  return { imageUrl: placeholder, source: 'placeholder' };
}
