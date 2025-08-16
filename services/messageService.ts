import { db } from "@/lib/firebase";
import { collection, doc, setDoc } from "firebase/firestore";

export const addMessageToSession = async (sessionId: string, message: any) => {

    const devicesColRef = collection(db, 'sessions', sessionId, 'devices');
    const newId = crypto.randomUUID();
    const deviceDocRef = doc(devicesColRef, newId); // use pubkey as ID to avoid duplicates
    await setDoc(deviceDocRef, message);

}
