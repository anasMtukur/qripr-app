import { admin } from '@/lib/firebaseAdmin';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId, devicePublicKeyBase64 } = req.body;

    if (!sessionId || !devicePublicKeyBase64) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    const db = admin.firestore();
    const sessionRef = db.collection('sessions').doc(sessionId);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists) {
      return res.status(404).json({ error: 'Session not found' });
    }

    await sessionRef.update({
      devices: admin.firestore.FieldValue.arrayUnion({
        joinedAt: admin.firestore.FieldValue.serverTimestamp(),
        publicKeyBase64: devicePublicKeyBase64,
      }),
    });

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Join session error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
