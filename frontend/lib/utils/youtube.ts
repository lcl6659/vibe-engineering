/**
 * YouTube URL parsing utilities
 */

/**
 * Extracts video ID from various YouTube URL formats
 * Supports:
 * - Direct ID: dQw4w9WgXcQ
 * - youtube.com: https://www.youtube.com/watch?v=dQw4w9WgXcQ
 * - youtu.be: https://youtu.be/dQw4w9WgXcQ
 * - With timestamp: https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=123s
 */
export function extractVideoId(input: string): string | null {
  if (!input) return null;

  const trimmed = input.trim();

  // Check if it's already a valid video ID (11 characters, alphanumeric)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);

    // Handle youtu.be format
    if (url.hostname === 'youtu.be' || url.hostname === 'www.youtu.be') {
      const videoId = url.pathname.slice(1); // Remove leading slash
      if (/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        return videoId;
      }
    }

    // Handle youtube.com format
    if (url.hostname === 'youtube.com' || url.hostname === 'www.youtube.com') {
      const videoId = url.searchParams.get('v');
      if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        return videoId;
      }
    }
  } catch (e) {
    // Not a valid URL, return null
    return null;
  }

  return null;
}

/**
 * Extracts playlist ID from YouTube playlist URL
 * Supports:
 * - Direct ID: PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf
 * - youtube.com: https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf
 */
export function extractPlaylistId(input: string): string | null {
  if (!input) return null;

  const trimmed = input.trim();

  // Check if it's already a playlist ID (starts with PL, typically 34 chars)
  if (/^(PL|UU|FL|RD)[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);

    // Handle youtube.com playlist URL
    if (url.hostname === 'youtube.com' || url.hostname === 'www.youtube.com') {
      const playlistId = url.searchParams.get('list');
      if (playlistId && /^(PL|UU|FL|RD)[a-zA-Z0-9_-]+$/.test(playlistId)) {
        return playlistId;
      }
    }
  } catch (e) {
    // Not a valid URL, return null
    return null;
  }

  return null;
}

/**
 * Validates if input is a valid YouTube video URL or ID
 */
export function isValidVideoInput(input: string): boolean {
  return extractVideoId(input) !== null;
}

/**
 * Validates if input is a valid YouTube playlist URL or ID
 */
export function isValidPlaylistInput(input: string): boolean {
  return extractPlaylistId(input) !== null;
}
