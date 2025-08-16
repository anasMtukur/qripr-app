function bufferToBase64(buf: ArrayBuffer) {
    // browser friendly
    const bytes = new Uint8Array(buf);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function base64ToBuffer(str: string) {
    return Buffer.from(str, 'base64');
}
  
export async function generateEphemeralKeyPair() {
    const kp = await window.crypto.subtle.generateKey(
      { name: 'ECDH', namedCurve: 'P-256' },
      true,
      ['deriveKey']
    );
    return kp; // {publicKey, privateKey}
}
  
export async function exportPublicKey(key: CryptoKey) {
    const spki = await crypto.subtle.exportKey('spki', key);
    return bufferToBase64(spki);
}
  
export async function importPublicKey(base64: string) {
    const buf = base64ToBuffer(base64);
    return crypto.subtle.importKey('spki', buf, { name: 'ECDH', namedCurve: 'P-256' }, true, []);
}
  
export async function deriveSharedSymmetricKey(privateKey: CryptoKey, remotePublicKey: CryptoKey) {
    const derived = await crypto.subtle.deriveKey(
      { name: 'ECDH', public: remotePublicKey },
      privateKey,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    return derived;
}
  
export async function encryptText(plaintext: string, key: CryptoKey) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder().encode(plaintext);
    const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc);
    return {
      iv: bufferToBase64(iv.buffer),
      cipherText: bufferToBase64(cipher)
    };
}
  
export async function decryptText(cipherBase64: string, ivBase64: string, key: CryptoKey) {
    const ct = base64ToBuffer(cipherBase64);
    const iv = base64ToBuffer(ivBase64);
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(iv) }, key, ct);
    return new TextDecoder().decode(plain);
}
  
export async function exportPublicKeyBase64(publicKey: CryptoKey) {
    const spki = await window.crypto.subtle.exportKey('spki', publicKey);
    const b64 = bufferToBase64(spki);
    return b64;
}
  