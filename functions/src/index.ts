import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

interface CreateSessionData {
  creatorPublicKeyBase64: string;
}

export const createSession = functions.https.onCall(
  async (request: functions.https.CallableRequest<CreateSessionData>) => {
    const { creatorPublicKeyBase64 } = request.data;

    if (!creatorPublicKeyBase64) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing public key');
    }

    const sessionId = db.collection('_').doc().id;

    await db.collection('sessions').doc(sessionId).set({
      owner: request.auth?.uid || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      encryption: 'ECDH-P256-AES-GCM-256',
      deviceLimit: request.auth ? 5 : 3,
      creatorPublicKeyBase64
    });

    return { sessionId };
  }
);
