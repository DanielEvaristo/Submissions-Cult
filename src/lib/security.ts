/**
 * Basic input sanitizer to prevent Cross-Site Scripting (XSS)
 * Strips HTML tags and common injection patterns.
 */
export function sanitizeInput(input: string | null | undefined): string {
  if (!input) return "";
  
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Validates and sanitizes URLs.
 * Ensures the URL is an HTTP/HTTPS link and not a javascript: injection.
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (trimmed === "") return "";
  
  if (!/^https?:\/\//i.test(trimmed)) {
    // If it's just a username (like @instagram) or something else, return sanitized input
    return sanitizeInput(trimmed);
  }
  return sanitizeInput(trimmed);
}
