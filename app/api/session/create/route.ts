import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin'; // your admin instance
import { addDeviceToSession } from '@/services/deviceService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { creatorPublicKeyBase64, owner = null, device, sessionType } = body || {};

    const sessionId = crypto.randomUUID();

    delete owner?.apiKey;
    delete owner?.appName;
    delete owner?.createdAt;
    delete owner?.providerData;
    delete owner?.stsTokenManager;

    await adminDb.collection('sessions').doc(sessionId).set({
      id: sessionId,
      type: sessionType,
      owner: owner,
      userId: owner?.uid ? owner?.uid : null,
      createdAt: new Date(),
      encryption: 'ECDH-P256-AES-GCM-256',
      deviceLimit: sessionType === 'free' ? 3 : 0,
      deviceCount: 0,
      creatorDevice: device,
      creatorPublicKeyBase64: creatorPublicKeyBase64 || null
    });

    await addDeviceToSession( sessionId, creatorPublicKeyBase64, {isCreator: true, ...device})

    return NextResponse.json({ sessionId });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'failed to create session' }, { status: 500 });
  }
}
