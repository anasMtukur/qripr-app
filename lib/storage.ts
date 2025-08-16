import { openDB } from 'idb';

const DB_NAME = 'qripr-db';
const DB_VERSION = 2; // bump version when adding new stores
const STORE_NAME = 'keys';
const SESSION_STORE_NAME = 'sessions';

/* 
//To add a new store, you’d bump version to 3 and add the store with code below
if (!db.objectStoreNames.contains("messages")) {
  db.createObjectStore("messages");
} 
*/

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create store only if it doesn't already exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
      if (!db.objectStoreNames.contains(SESSION_STORE_NAME)) {
        db.createObjectStore(SESSION_STORE_NAME);
      }
    },
  });
}

export async function savePrivateKey(sessionId: string, key: CryptoKey) {
  const db = await getDB();
  const raw = await crypto.subtle.exportKey('pkcs8', key);
  await db.put(STORE_NAME, raw, sessionId);
}

export async function loadPrivateKey(sessionId: string): Promise<CryptoKey | null> {
  const db = await getDB();
  const raw = await db.get(STORE_NAME, sessionId);
  if (!raw) return null;
  return crypto.subtle.importKey(
    'pkcs8',
    raw,
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveKey']
  );
}

export async function saveSessionIdToIndexedDB(sessionId: string) {
  const db = await getDB();
  await db.put(SESSION_STORE_NAME, sessionId, sessionId); // key = value
}

export async function getGuestSessions() {
  const db = await getDB();
  return db.getAll(SESSION_STORE_NAME);
}

export async function clearGuestSessions() {
  const db = await getDB();
  await db.clear(SESSION_STORE_NAME);
}
