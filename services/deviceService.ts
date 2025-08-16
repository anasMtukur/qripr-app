import { db } from "@/lib/firebase";
import { collection, doc, setDoc } from "firebase/firestore";

export const addDeviceToSession = async (sessionId: string, exportedPubKeyBase64: string, deviceInfo: any) => {

    const devicesColRef = collection(db, 'sessions', sessionId, 'devices');
    const newId = crypto.randomUUID();
    const deviceDocRef = doc(devicesColRef, newId); // use pubkey as ID to avoid duplicates
    await setDoc(deviceDocRef, {
        ...deviceInfo,
        publicKeyBase64: exportedPubKeyBase64,
        joinedAt: new Date(),
    });

}