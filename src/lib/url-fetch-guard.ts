import dns from "dns/promises";

const ALLOWED_HOSTS = new Set([
  "open.spotify.com",
  "spotify.com",
  "spotify.link",
  "on.soundcloud.com",
  "soundcloud.com",
  "www.soundcloud.com",
  "deezer.com",
  "www.deezer.com",
  "api.deezer.com",
]);

function normalizeHost(hostname: string): string {
  return hostname.replace(/^www\./, "").toLowerCase();
}

function isPrivateIp(ip: string): boolean {
  if (ip.includes(":")) {
    const lower = ip.toLowerCase();
    return (
      lower === "::1" ||
      lower.startsWith("fc") ||
      lower.startsWith("fd") ||
      lower.startsWith("fe80:")
    );
  }
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return true;
  const [a, b] = parts;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
}

export function isAllowedStreamingHost(hostname: string): boolean {
  const host = normalizeHost(hostname);
  if (ALLOWED_HOSTS.has(host)) return true;
  return host.endsWith(".spotify.com") || host.endsWith(".soundcloud.com") || host.endsWith(".deezer.com");
}

export async function assertSafeExternalUrl(raw: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error("Invalid URL");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Invalid protocol");
  }

  if (!isAllowedStreamingHost(parsed.hostname)) {
    throw new Error("Host not allowed");
  }

  const resolved = await dns.lookup(parsed.hostname, { all: true });
  if (resolved.some((entry) => isPrivateIp(entry.address))) {
    throw new Error("Blocked host");
  }

  return parsed;
}

export async function safeExternalFetch(
  raw: string,
  init?: RequestInit & { timeoutMs?: number }
): Promise<Response> {
  const safeUrl = await assertSafeExternalUrl(raw);
  const timeoutMs = init?.timeoutMs ?? 8000;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const { timeoutMs: _ignored, ...fetchInit } = init ?? {};
    return await fetch(safeUrl.toString(), {
      ...fetchInit,
      signal: controller.signal,
      redirect: "manual",
    });
  } finally {
    clearTimeout(timeout);
  }
}

/** Follow redirects only when every hop stays on an allowed host. */
export async function resolveAllowedUrl(raw: string, maxHops = 5): Promise<string> {
  let current = raw;

  for (let hop = 0; hop < maxHops; hop++) {
    const safe = await assertSafeExternalUrl(current);
    const res = await safeExternalFetch(safe.toString(), { method: "HEAD", timeoutMs: 5000 });

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) break;
      current = new URL(location, safe.toString()).toString();
      continue;
    }

    return safe.toString();
  }

  return (await assertSafeExternalUrl(current)).toString();
}
