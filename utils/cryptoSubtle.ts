// utils/cryptoSubtle.ts
let subtle: SubtleCrypto;

export async function getCryptoSubtle(): Promise<SubtleCrypto> {
  if (typeof window === 'undefined') {
    throw new Error('getCryptoSubtle() must be called in the browser');
  }

  if (window.crypto?.subtle) {
    // Secure context, real Web Crypto API
    return window.crypto.subtle;
  }

  if (process.env.NODE_ENV === 'development') {
    // Dev fallback: load polyfill
    const { Crypto } = await import('@peculiar/webcrypto');
    const polyfill = new Crypto();
    return polyfill.subtle;
  }

  throw new Error('Web Crypto API not available. Use HTTPS.');
}
