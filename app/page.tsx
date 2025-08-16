'use client'
import { useRouter } from 'next/navigation'
import { generateEphemeralKeyPair, exportPublicKeyBase64 } from '@/lib/encryption'
import { useEffect, useState } from 'react'
import { savePrivateKey, saveSessionIdToIndexedDB } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleAuthProvider, isSignInWithEmailLink, sendSignInLinkToEmail, signInWithEmailLink, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { isValidEmail } from '@/utils/emailChecker';
import toast from 'react-hot-toast';
import Button from '@/components/Button';
import { BsGoogle } from 'react-icons/bs';
import { FaPaperPlane } from 'react-icons/fa';
import { getDeviceInfo } from '@/utils/deviceInfo';
import { saveOwnPublic } from '@/lib/keys';
import { startGuestSession } from '@/services/sessionActions';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const [email, setEmail] = useState('');

  useEffect(() => {
    if( user ) {
      router.push('/session');
    }

    const storedEmail = window.localStorage.getItem('emailForSignIn');
    if (isSignInWithEmailLink(auth, window.location.href) && storedEmail) {
      signInWithEmailLink(auth, storedEmail, window.location.href)
        .then(() => {
          window.localStorage.removeItem('emailForSignIn');
          router.push('/session');
        })
        .catch(console.error);
    }
  }, [router, user]);

  const handleSubmit = async () => {
    setLoading(true);
    if(!email || !isValidEmail(email)){
      toast.error('Please enter a valid email.');
      return;
    }

    const actionCodeSettings = {
      url: window.location.href,
      handleCodeInApp: true,
    };

    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    window.localStorage.setItem('emailForSignIn', email);
    toast.success( "Check your email for the login link!" );

    setLoading(false);
  };

  const signIn = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    router.push('/session');
  };

  const onGetStarted = async () => {
    setLoading(true);

    const deviceInfo = getDeviceInfo();
    const kp = await generateEphemeralKeyPair();
    const pubB64 = await exportPublicKeyBase64(kp.publicKey);
    const deviceName = `${deviceInfo.platform?.split(' ')[0]} - ${deviceInfo.vendor}`;

    const res = await fetch('/api/create-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creatorPublicKeyBase64: pubB64, owner: user, device: {name: deviceName, ...deviceInfo} })
    });

    const data = await res.json();
    if (data?.sessionId) {
      saveSessionIdToIndexedDB(data.sessionId)

      await savePrivateKey(data.sessionId, kp.privateKey);
      saveOwnPublic(data.sessionId, pubB64);
      
      toast.success( "Guest session created succesfully!" );
      router.push(`/session/${data.sessionId}`);
    } else {
      toast.error('Failed to create session');
    }

    setLoading(false);
  }
  const handleGetStarted = async () => {
    try {
      setLoading(true);
      await startGuestSession({uid: null}, router);
    } catch (err) {
      toast.error('Could not start session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[85vh] flex flex-col items-center justify-start text-center mb-1 p-6">
      <h1 className="text-4xl font-bold mb-4">Qripr</h1>
      <p className="mb-6">Secure shared clipboard — copy between devices with E2EE.</p>
      
      <div className='w-1/2 justify-center group mt-auto relative'>
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full border border-slate-300 hover:border-slate-800 focus:border-slate-800 active:border-slate-800 py-4 px-4 pr-16 rounded-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button
          text='Send Link'
          action={handleSubmit}
          icon={<FaPaperPlane className='mt-[1px] mr-3' />}
          className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center px-4 py-3 mt-0"
          isDisabled={!isValidEmail(email)}
          isLoading={loading}
        />            
      </div>

      <div className='w-full mt-auto mb-4 flex items-start justify-center'>
        <Button
          text='Continue with Google'
          action={signIn}
          className="px-4 py-4"
          icon={<BsGoogle className='mt-[2px] mr-3' />}
          isLoading={loading}             
        />
      </div>

      <button
        onClick={handleGetStarted}
        disabled={loading}
        className="text-blue-600 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed bg-transparent px-0 py-0"
      >
        {loading ? 'Creating guest session...' : 'Continue as a guest'}
      </button>

    </main>
  )
}