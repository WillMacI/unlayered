import type { SongSection, TimedLyricAnnotation, SectionType } from '../types/audio';

/**
 * Calculate similarity between two strings (0 to 1)
 * Using a simple dice coefficient for word overlap
 */
function similarity(s1: string, s2: string): number {
    const normalize = (s: string) => s.toLowerCase().replace(/[^\w\s]/g, '').trim();
    const a = normalize(s1);
    const b = normalize(s2);

    if (a === b) return 1;
    if (!a || !b) return 0;

    const aWords = new Set(a.split(/\s+/));
    const bWords = new Set(b.split(/\s+/));

    const intersection = new Set([...aWords].filter(x => bWords.has(x)));

    return (2 * intersection.size) / (aWords.size + bWords.size);
}

/**
 * Leventshtein distance for more precise matching on short lines
 */
function levenshteinDistance(s1: string, s2: string): number {
    const a = s1.toLowerCase().trim();
    const b = s2.toLowerCase().trim();
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    // increment along the first column of each row
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    // increment each column in the first row
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1 // deletion
                    )
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

function isMatch(s1: string, s2: string): boolean {
    const sim = similarity(s1, s2);
    if (sim > 0.6) return true;

    // Fallback for short lines
    const dist = levenshteinDistance(s1, s2);
    const maxLen = Math.max(s1.length, s2.length);
    return (1 - dist / maxLen) > 0.7;
}

interface SectionBlock {
    label: string;
    lines: string[];
}

export function extractStructure(
    geniusLyrics: string | null,
    timedLyrics: TimedLyricAnnotation[],
    duration: number
): SongSection[] {
    if (!geniusLyrics || !timedLyrics || timedLyrics.length === 0) return [];

    // 1. Parse Genius Lyrics into Sections
    const sectionBlocks: SectionBlock[] = [];
    const lines = geniusLyrics.split('\n');

    let currentLabel = 'Intro'; // Default start
    let currentLines: string[] = [];

    // Regex for [Header]
    const headerRegex = /^\[(.*?)\]$/;

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        const match = trimmed.match(headerRegex);
        if (match) {
            // New section starting, push previous if it has content
            if (currentLines.length > 0) {
                sectionBlocks.push({ label: currentLabel, lines: [...currentLines] });
            }
            currentLabel = match[1]; // e.g. "Chorus", "Verse 1"
            currentLines = [];
        } else {
            currentLines.push(trimmed);
        }
    }
    // Push final section
    if (currentLines.length > 0) {
        sectionBlocks.push({ label: currentLabel, lines: currentLines });
    }

    console.log('[structureParser] Parsed Section Blocks:', sectionBlocks);

    // 2. Map Sections to Timed Lyrics
    const sections: SongSection[] = [];
    let searchStartIndex = 0;

    for (const block of sectionBlocks) {
        if (block.lines.length === 0) continue;

        // Try to find the first line of this block in timed lyrics
        // We search from where we left off to maintain order
        let matchIndex = -1;
        const firstLine = block.lines[0];

        // Look ahead in timed lyrics
        for (let i = searchStartIndex; i < timedLyrics.length; i++) {
            // Try matching first line
            if (isMatch(firstLine, timedLyrics[i].line)) {
                matchIndex = i;
                break;
            }
            // Fallback: try matching second line if first is short/common (e.g. "Yeah")
            if (block.lines.length > 1 && i + 1 < timedLyrics.length) {
                if (isMatch(block.lines[1], timedLyrics[i + 1].line)) {
                    // If second line matches, assume this is the block starting at i (if first line somewhat plausible or skipped)
                    // Actually, if second line matches i+1, then i is likely first line.
                    matchIndex = i;
                    break;
                }
            }
        }

        if (matchIndex !== -1) {
            const startTime = timedLyrics[matchIndex].startTime;
            if (startTime !== null) {
                // Determine Section Type
                const labelLower = block.label.toLowerCase();
                let type: SectionType = 'verse'; // Default
                if (labelLower.includes('intro')) type = 'intro';
                else if (labelLower.includes('chorus')) type = 'chorus';
                else if (labelLower.includes('bridge')) type = 'bridge';
                else if (labelLower.includes('outro')) type = 'outro';
                else if (labelLower.includes('solo')) type = 'solo';
                else if (labelLower.includes('instrumental')) type = 'solo';
                else if (labelLower.includes('pre')) type = 'pre-chorus';
                else if (labelLower.includes('post')) type = 'post-chorus';
                else if (labelLower.includes('drop')) type = 'drop';

                sections.push({
                    type,
                    label: block.label,
                    startTime: startTime,
                    endTime: 0, // Will fill later
                });

                // Advance search index (skip some lines to avoid re-matching same chorus immediately if it repeats in text? 
                // Genius usually writes out repeats. So we strictly move forward.)
                // Advance by at least 1, or by number of lines in block?
                // Be conservative, advance by 1. But better: advance to matchIndex + block.lines.length (roughly)
                // Let's just set searchStartIndex = matchIndex + 1 to allow overlapping/interleaved checks if needed, 
                // but realistically sections prevent overlap.
                searchStartIndex = matchIndex + 1;
            }
        }
    }

    // 3. Fill End Times
    // Sort sections by time just in case (though loop order should preserve it if lyrics are linear)
    sections.sort((a, b) => a.startTime - b.startTime);

    for (let i = 0; i < sections.length; i++) {
        if (i < sections.length - 1) {
            sections[i].endTime = sections[i + 1].startTime;
        } else {
            sections[i].endTime = duration;
        }
    }

    // Filter out very short sections (artifacts) or fix overlaps
    return sections.filter(s => s.endTime - s.startTime > 1);
}
