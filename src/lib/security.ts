/**
 * Basic input sanitizer to prevent Cross-Site Scripting (XSS)
 * Strips HTML tags and common injection patterns.
 */
export function sanitizeInput(input: string | null | undefined): string {
  if (!input) return "";
  
  // React automatically escapes HTML bindings, but we do basic escaping for < and > 
  // just in case this data is used in non-React contexts (like email HTML).
  // We DO NOT escape slashes or quotes because it breaks standard text like "N/A" or URLs.
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Validates and sanitizes URLs.
 * Extracts profile links from known platforms if a song/video link is pasted.
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return "";
  let trimmed = url.trim();
  if (trimmed === "") return "";
  
  if (!/^https?:\/\//i.test(trimmed)) {
    // If it's just a username or "N/A"
    return sanitizeInput(trimmed);
  }

  // Remove tracking / query parameters
  trimmed = trimmed.split("?")[0];

  try {
    const urlObj = new URL(trimmed);
    const host = urlObj.hostname.replace(/^www\./, '').toLowerCase();
    const pathParts = urlObj.pathname.split('/').filter(Boolean);

    // Extract profile part from song/video links
    if (host === 'soundcloud.com' && pathParts.length > 0) {
      return `https://soundcloud.com/${pathParts[0]}`;
    }
    if (host === 'tiktok.com' && pathParts.length > 0 && pathParts[0].startsWith('@')) {
      return `https://www.tiktok.com/${pathParts[0]}`;
    }
    if (host === 'instagram.com' && pathParts.length > 0) {
      // Ignore reels/p/etc, just get the username
      return `https://www.instagram.com/${pathParts[0]}`;
    }
    if (host === 'youtube.com' && pathParts.length > 0 && pathParts[0].startsWith('@')) {
      return `https://www.youtube.com/${pathParts[0]}`;
    }
  } catch (e) {
    // Ignore URL parse errors
  }

  return trimmed;
}
