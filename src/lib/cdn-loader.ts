/**
 * Resilient CDN script loader with retry + multi-CDN fallback.
 * Used by Video Compressor and PDF Editor to load heavy libraries at runtime.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Try loading a script from a URL. Returns true on success. */
function tryLoadScript(src: string, timeout = 15_000): Promise<boolean> {
  return new Promise((resolve) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) { resolve(true); return; }

    const s = document.createElement("script");
    s.src = src;
    s.async = true;

    const timer = setTimeout(() => { s.remove(); resolve(false); }, timeout);

    s.onload = () => { clearTimeout(timer); resolve(true); };
    s.onerror = () => { clearTimeout(timer); s.remove(); resolve(false); };
    document.head.appendChild(s);
  });
}

/**
 * Load a script from a list of CDN URLs with automatic fallback.
 * Tries each URL in order; throws if all fail.
 */
export async function loadScriptWithFallback(
  urls: string[],
  label: string,
): Promise<void> {
  for (const url of urls) {
    const ok = await tryLoadScript(url);
    if (ok) return;
  }
  throw new Error(
    `Unable to load ${label}. Please check your internet connection and try again.`,
  );
}

/**
 * Fetch a resource and convert it to a blob URL.
 * Replaces the need for @ffmpeg/util's toBlobURL.
 */
export async function toBlobURL(url: string, mimeType: string): Promise<string> {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Fetch failed: ${url} (${resp.status})`);
  const buf = await resp.arrayBuffer();
  const blob = new Blob([buf], { type: mimeType });
  return URL.createObjectURL(blob);
}

/**
 * Fetch a file from multiple CDN URLs with fallback.
 */
export async function fetchWithFallback(
  urls: string[],
  label: string,
): Promise<ArrayBuffer> {
  for (const url of urls) {
    try {
      const resp = await fetch(url);
      if (resp.ok) return await resp.arrayBuffer();
    } catch { /* try next */ }
  }
  throw new Error(
    `Unable to download ${label}. Please check your internet connection and try again.`,
  );
}

/* eslint-enable @typescript-eslint/no-explicit-any */
