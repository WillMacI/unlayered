/**
 * Parse LRC format lyrics into our lyrics data structure
 * LRC format: [mm:ss.xx]Lyric text
 */
export function parseLRC(lrcContent: string): { text: string; startTime: number; endTime: number }[] {
  const lines = lrcContent.split('\n');
  const lyrics: { text: string; startTime: number }[] = [];

  // Regex to match timestamp [m]m:ss[.fff] (fractional part optional)
  const timeRegex = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g;

  for (const line of lines) {
    const matches = [...line.matchAll(timeRegex)];
    if (matches.length === 0) continue;

    // Extract the text after the last timestamp
    const lastMatch = matches[matches.length - 1];
    const text = line.substring(lastMatch.index! + lastMatch[0].length).trim();

    if (!text) continue; // Skip empty lines

    // Parse each timestamp on the line
    for (const match of matches) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const fraction = match[3] ? match[3].padEnd(3, '0') : '0';
      const milliseconds = parseInt(fraction, 10);
      const startTime = minutes * 60 + seconds + milliseconds / 1000;

      lyrics.push({ text, startTime });
    }
  }

  // Sort by start time
  lyrics.sort((a, b) => a.startTime - b.startTime);

  // Calculate end times (start of next line, or +3 seconds for last line)
  return lyrics.map((lyric, index) => ({
    text: lyric.text,
    startTime: lyric.startTime,
    endTime: index < lyrics.length - 1 ? lyrics[index + 1].startTime : lyric.startTime + 3,
  }));
}

/**
 * Fetch and parse an LRC file from a URL
 */
export async function fetchAndParseLRC(url: string): Promise<{ text: string; startTime: number; endTime: number }[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch LRC from "${url}": ${response.status} ${response.statusText}`);
  }
  const lrcContent = await response.text();
  return parseLRC(lrcContent);
}
