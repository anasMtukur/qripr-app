'use client';
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getDeviceInfo } from '@/utils/deviceInfo';
import { savePrivateKey } from '@/lib/storage';
import { saveOwnPublic } from '@/lib/keys';
import { exportPublicKeyBase64 } from '@/lib/encryption';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { FaPaperPlane } from 'react-icons/fa';
import Button from '@/components/Button';
import { formatDate } from '@/utils/dateFormatter';
import { joinSession } from '@/services/sessionActions';

export default function JoinSessionPage() {
  const router = useRouter();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [session, setSession] = useState<any>(null)
  const { id: sessionId } = useParams<{ id: string }>();

  useEffect(()=>{
    let unsubSession: any

    async function init() {
      const ref = doc(db, 'sessions', sessionId)
      
      unsubSession = onSnapshot(ref, async (snap)=>{
        if (!snap.exists()) return
        const data = snap.data()
        setSession(data)
      })

    }

    init()

    return () => {
      if (unsubSession) unsubSession()
    }
  }, [sessionId])


  const handleJoin = async () => {
    setLoading(true);
    setStatus('Joining session...');
    const deviceInfo = getDeviceInfo();
    try {
      const { sharedKey, keyPair } = await joinSession(sessionId, {name: deviceName, ...deviceInfo});
      
      await savePrivateKey( sessionId, keyPair.privateKey );
      
      const pubB64 = await exportPublicKeyBase64(keyPair.publicKey);
      saveOwnPublic(sessionId, pubB64);
      setStatus('Joined successfully!');
      
      router.push(`/session/${sessionId}`);
    } catch (err) {
      console.error(err);
      setStatus('Error joining session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[83vh] flex flex-col items-center justify-start text-center mb-1 p-6">
      <h1 className="text-4xl font-bold mb-4">Join Session</h1>
      <p className="mb-6">You are about to join a secure shared clipboard — copy between devices with E2EE.</p>
      
      <div className="relative flex flex-col my-6 bg-white shadow-sm border border-slate-200 rounded-lg w-96">
        <div className="p-4">
          <div className="mb-4 pb-4 flex items-center justify-between border-b-2 border-slate-200">
            <h5 className="text-slate-800 text-lg font-semibold">
              Session Details
            </h5>
          </div>
          {session && 
            <div className="divide-y divide-slate-200">
              <div className="text-start py-4">
                <strong>Creator Device:</strong>{' '}
                <span className="ml-auto float-end capitalize">{session?.creatorDevice?.name}</span>
              </div>
              <div className="text-start py-4">
                <strong>Session Type:</strong>{' '}
                <span className='ml-auto float-end capitalize px-2.5 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>{session?.type}</span>
              </div>
              <div className="text-start py-4">
                <strong>Device Limit:</strong>{' '}
                <span className="ml-auto float-end capitalize">{session?.deviceLimit}</span>
              </div>
              <div className="text-start py-4">
                <strong>Device Count:</strong>{' '}
                <span className="ml-auto float-end capitalize">{session?.deviceCount}</span>
              </div>
              <div className="text-start py-4">
                <strong>Created At:</strong>{' '}
                <span className="ml-auto float-end capitalize">{formatDate(session?.createdAt)}</span>
              </div>
            </div>
          }
        </div>
      </div>

      { session?.type === 'free' && session?.deviceLimit > session?.deviceCount || true &&
        <>
        <div className='w-1/2 justify-center group mt-auto relative'>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Give this device a name for easier identification
          </label>
          <input
            placeholder="Enter a name for the device"
            className="w-full border border-slate-300 hover:border-slate-800 focus:border-slate-800 active:border-slate-800 py-4 px-4 pr-16 rounded-full"
            id="deviceName" 
            type="text" 
            onChange={(e) => setDeviceName(e.target.value)}
          />
          <Button
            text='Join Session'
            action={handleJoin}
            icon={<FaPaperPlane className='mt-[1px] mr-3' />}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center px-4 py-3 mt-3.5"
            isDisabled={loading || !agreed}
            isLoading={loading}
          />            
        </div>
        <label className="block mt-4">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />{' '}
          I agree to the terms and conditions 
        </label>
        </>
      }

      
    </main>
  );
}
