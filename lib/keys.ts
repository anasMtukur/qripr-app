// lib/keys.ts

/**
 * Save the device's public key for a given session.
 * Stored in localStorage so we can identify "self" later.
 */
export function saveOwnPublic(sessionId: string, pubB64: string) {
    try {
      localStorage.setItem(`qripr.${sessionId}.pub`, pubB64);
    } catch (e) {
      console.error("Failed to save own public key", e);
    }
}

/**
 * Load the device's public key for a given session.
 */
export function loadOwnPublic(sessionId: string): string | null {
    try {
        return localStorage.getItem(`qripr.${sessionId}.pub`) || null;
    } catch (e) {
        console.error("Failed to load own public key", e);
        return null;
    }
}
  