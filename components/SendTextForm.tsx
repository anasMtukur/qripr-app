'use client';

import { importPublicKey, deriveSharedSymmetricKey, encryptText } from "@/lib/encryption";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { FaPaperPlane, FaSpinner } from "react-icons/fa";
import { ImSpinner10 } from "react-icons/im";
import { twMerge } from "tailwind-merge";
import Button from "./Button";
import { loadOwnPublic } from "@/lib/keys";
import { loadPrivateKey } from "@/lib/storage";
import toast from "react-hot-toast";

type SendTextFormProps = {
  sessionId: string;
  sessionMeta: any;
  devices: any[];
};
export default function SendTextForm({ sessionId, sessionMeta, devices }: SendTextFormProps) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  const privateKeyRef = useRef<CryptoKey | null>(null)
  const ownPubRef = useRef<string | null>(null)

  useEffect( ()=>{
    async function init() {
      const priv = await loadPrivateKey(sessionId)
      if (priv) {
        privateKeyRef.current = priv
        ownPubRef.current = loadOwnPublic(sessionId)
      } else {
        toast.error('No private key found locally. Join the session first.')
      }
    }
    init();
  }, [sessionId])

  const sendMessage = async () => {
    setLoading(true);
    if (!privateKeyRef.current) {
      alert('No private key found. Cannot send.')
      return
    }
    if (!sessionMeta) {
      alert('Session not loaded')
      return
    }

    const ownPub = ownPubRef.current
    for (const device of devices) {
      const recipientPubB64 = device.publicKeyBase64 || device.publicKey || device.pub
      if (!recipientPubB64 || recipientPubB64 === ownPub) continue
      try {
        const recipientPub = await importPublicKey(recipientPubB64)
        const sym = await deriveSharedSymmetricKey(privateKeyRef.current!, recipientPub)
        const cipher = await encryptText(text, sym)
        await addDoc(collection(db, 'sessions', sessionId, 'messages'), {
          senderPublicKeyBase64: ownPub,
          recipientPublicKeyBase64: recipientPubB64,
          iv: cipher.iv,
          cipherText: cipher.cipherText,
          timestamp: serverTimestamp()
        })

        setText('')
      } catch (e) {
        console.error('Failed to encrypt/send to device', device, e)
      }
    }

    setLoading(false);
  }

  return (
    <div className="flex items-center">
      <textarea value={text} onChange={(e)=>setText(e.target.value)} placeholder="Type a message..." className="w-full p-2 rounded-none border border-slate-300 focus:outline-none focus:border-blue-500 me-2x" />
      <Button
        text='Send'
        action={sendMessage}
        className="px-4 py-4 border-0 border-lx h-full rounded-none shadow-none hover:shadow-none hover:scale-y-[1.15] transition-all cursor-pointer"
        icon={<FaPaperPlane className='mt-[2px] mr-3' />}
        isLoading={loading}     
        isDisabled={loading || text.length === 0}        
      />
    </div>
  );
}