import { generateEphemeralKeyPair, exportPublicKeyBase64 } from '@/lib/encryption';
import { savePrivateKey, saveSessionIdToIndexedDB } from '@/lib/storage';
import { getDeviceInfo } from '@/utils/deviceInfo';
import { saveOwnPublic } from '@/lib/keys';
import toast from 'react-hot-toast';
import { deleteSession } from '@/services/sessionServices';
import { db } from '@/lib/firebase';
import { JoinSessionResult } from '@/types';
import { getCryptoSubtle } from '@/utils/cryptoSubtle';
import { doc, getDoc, increment, updateDoc } from 'firebase/firestore';
import { addDeviceToSession } from './deviceService';

export async function startGuestSession(user: any, router: any, sessionType: string = 'free') {
  const kp = await generateEphemeralKeyPair();
  const pubB64 = await exportPublicKeyBase64(kp.publicKey);
  const deviceInfo = getDeviceInfo();
  const deviceName = `${deviceInfo.platform?.split(' ')[0]} - ${deviceInfo.vendor}`;

  const res = await fetch('/api/session/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creatorPublicKeyBase64: pubB64,
      owner: user,
      device: { name: deviceName, ...deviceInfo },
      sessionType
    })
  });

  const data = await res.json();
  if (data?.sessionId) {
    if(!user || !user.uid) saveSessionIdToIndexedDB(data.sessionId)

    await savePrivateKey(data.sessionId, kp.privateKey);
    saveOwnPublic(data.sessionId, pubB64);

    toast.success('Guest session created successfully!');
    router.push(`/session/${data.sessionId}`);
  } else {
    toast.error('Failed to create session');
  }
}

export async function joinSession(sessionId: string, deviceInfo: Record<string, any>) : Promise<JoinSessionResult>{
  // 1. Fetch session
  const sessionRef = doc(db, 'sessions', sessionId);
  const snap = await getDoc(sessionRef);
  if (!snap.exists()) {
    throw new Error('Session not found');
  }

  const session = snap.data();
  if (!session.creatorPublicKeyBase64) {
    throw new Error('Creator public key missing from session');
  }

  // 2. Generate our own ECDH key pair
  const subtle = await getCryptoSubtle();
  const keyPair = await subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    ['deriveKey', 'deriveBits']
  );

  // 3. Derive shared key from creator's public key
  const creatorPubKeyBuffer = Uint8Array.from(atob(session.creatorPublicKeyBase64), c => c.charCodeAt(0));
  const creatorPubKey = await subtle.importKey(
    'spki',
    creatorPubKeyBuffer.buffer,
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    []
  );

  const sharedKey = await subtle.deriveKey(
    {
      name: 'ECDH',
      public: creatorPubKey,
    },
    keyPair.privateKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );

  // 4. Store our public key to the session so others can see we joined
  const exportedPubKey = await subtle.exportKey('spki', keyPair.publicKey);
  const exportedPubKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(exportedPubKey)));

  await addDeviceToSession( sessionId, exportedPubKeyBase64, deviceInfo);
  await updateDoc(sessionRef, {
    deviceCount: increment(1),
  });

  return { sharedKey, keyPair };
}

export async function removeSession(sessionId: string, userId: string, reloadSessions: (uid: string) => Promise<void>) {
  await deleteSession(sessionId);
  await reloadSessions(userId);
}
