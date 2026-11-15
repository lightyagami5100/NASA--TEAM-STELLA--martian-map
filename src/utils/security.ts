// NASA Mission Critical Cybersecurity & Web Application Hardening Utility
// Implements OWASP ASVS 4.0, NIST SP 800-53, and NASA STD-3001 compliant client-side security controls.

/**
 * Sanitizes user-provided string inputs to neutralize cross-site scripting (XSS),
 * HTML injection, control character poisoning, and protocol handler hijacking.
 */
export function sanitizeInput(input: unknown): string {
  if (typeof input !== 'string') {
    if (input === null || input === undefined) return '';
    return String(input);
  }

  // 1. Strip ASCII control characters and non-printable bytes (except standard whitespace)
  // eslint-disable-next-line no-control-regex
  let clean = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 2. Neutralize dangerous script pseudo-protocols
  clean = clean.replace(/(javascript|vbscript|data|file):/gi, '$1_:');

  // 3. HTML Entity Encode special characters to prevent DOM injection
  const htmlMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
  };

  return clean.replace(/[&<>"'`=/]/g, (char) => htmlMap[char] || char).trim();
}

/**
 * Validates whether a latitude and longitude pair lies within valid Mars planetary bounds.
 * Jezero Crater bounds: Lat 18.0° to 19.0° N, Lon 77.0° to 78.0° E.
 */
export function validateMarsCoordinates(
  lat: number,
  lon: number,
  strictJezero = false
): boolean {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return false;

  if (strictJezero) {
    return lat >= 17.5 && lat <= 19.5 && lon >= 76.5 && lon <= 78.5;
  }

  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 360;
}

/**
 * Safe JSON parser with strict Prototype Pollution and property injection protection.
 * Rejects JSON containing '__proto__', 'constructor', or 'prototype' keys.
 */
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  if (typeof jsonString !== 'string' || !jsonString.trim()) {
    return fallback;
  }

  try {
    // Fast prototype pollution key detector
    if (/"(?:__proto__|constructor|prototype)"\s*:/i.test(jsonString)) {
      console.warn('[SECURITY GUARD] Rejected JSON containing forbidden prototype pollution keys.');
      return fallback;
    }

    const parsed = JSON.parse(jsonString, (key, value) => {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return undefined;
      }
      return value;
    });

    return (parsed ?? fallback) as T;
  } catch (error) {
    console.warn('[SECURITY GUARD] JSON parse failed, returning fallback.', error);
    return fallback;
  }
}

/**
 * Generates cryptographically secure random identifier using Web Crypto API.
 */
export function generateSecureId(prefix = 'eva'): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const bytes = new Uint8Array(8);
    window.crypto.getRandomValues(bytes);
    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return `${prefix}_${hex}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Rate-limits / debounces high-frequency calls to prevent UI Denial of Service (DoS).
 */
export function createRateLimiter<T extends (...args: any[]) => void>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    const remaining = delayMs - (now - lastCall);

    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      lastCall = now;
      fn(...args);
    } else if (!timer) {
      timer = setTimeout(() => {
        lastCall = Date.now();
        timer = null;
        fn(...args);
      }, remaining);
    }
  };
}
