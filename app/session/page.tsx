'use client'
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/Button';
import { FaPaperPlane, FaQrcode, FaSpinner } from 'react-icons/fa';
import { GoTrash } from 'react-icons/go';
import Link from 'next/link';
import ListItem from '@/components/ListItem';
import { getUserSessions } from '@/services/sessionServices';
import toast from 'react-hot-toast';
import { Session } from '@/types';
import { removeSession, startGuestSession } from '@/services/sessionActions';
import { getAccountById } from '@/services/accountService';

export default function UserSessionsPage() {
  const [mySessions, setMySessions] = useState<Session[]>([]);
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    loadSessions(user.uid);
    getAccountById(user.uid).then(acc => setAccount(acc));
  }, [user, router]);

  const loadSessions = async (userId: string) => {
    const sessions = await getUserSessions(userId);
    setMySessions(sessions);
  };

  const handleGetStarted = async () => {
    try {
      setLoading(true);
      await startGuestSession(user, router, account?.accountType);
    } catch (err) {
      toast.error('Could not start session');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      setLoading(true);
      await removeSession(sessionId, user?.uid!, loadSessions);
    } catch (err) {
      toast.error('Could not delete session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[84vh] flex flex-col items-center p-6">
      <h1 className="text-4xl font-bold mb-4">Qripr</h1>
      <p className="mb-6">Hi, {user?.displayName}</p>

      <div className="relative flex flex-col my-6 bg-white shadow-sm border border-slate-200 rounded-lg w-96">
        <div className="p-4">
          <div className="mb-4 pb-4 flex items-center justify-between border-b-2 border-slate-200">
            <h5 className="text-slate-800 text-lg font-semibold">Sessions</h5>
          </div>
          <div className="divide-y divide-slate-200">
            {mySessions.length === 0 ? (
              <p className="text-gray-500">No sessions found.</p>
            ) : (
              mySessions.map((s, i) => (
                <ListItem
                  key={i}
                  index={i}
                  title={s.creatorDevice ? s.creatorDevice.name : `${s.creatorPublicKeyBase64?.slice(0, 10)}...`}
                  subtitle={s.type === 'pro' ? 'Devices: Unlimited' : `Devices: ${s.deviceCount || 0} / ${s.deviceLimit}`}
                  leftButtonContent={
                    <Link
                      href={`/session/${s.id}`}
                      className="bg-white text-slate-500 dark:bg-gray-950 w-[3rem] h-[3rem] border rounded-full flex items-center justify-center hover:scale-[1.15] active:scale-105 transition-all mr-2"
                    >
                      <FaQrcode />
                    </Link>
                  }
                  rightButtonContent={
                    <button
                      onClick={() => handleDeleteSession(s.id as string)}
                      className="bg-white text-red-500 dark:bg-gray-950 w-[3rem] h-[3rem] border rounded-full flex items-center justify-center hover:scale-[1.15] active:scale-105 transition-all"
                    >
                      {loading ? <FaSpinner className="spinner-icon" /> : <GoTrash />}
                    </button>
                  }
                />
              ))
            )}
          </div>
        </div>
      </div>

      {mySessions.length === 0 ? (
        <div className="w-full mt-auto mb-4 flex flex-col items-center">
          <label className="block mt-4">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />{' '}
            I agree to the terms and conditions
          </label>
          <Button
            text="Get started with a session"
            action={handleGetStarted}
            icon={<FaPaperPlane className="mt-[2px] mr-3" />}
            isLoading={loading}
            isDisabled={loading || !agreed}
          />
        </div>
      ):(
        (account?.accountType === 'pro' || (account?.accountType === 'free' && mySessions.length < 5)) && (
          <div className="w-full mt-auto mb-4 flex flex-col items-center">
            <Button
              text="Start a new session"
              action={handleGetStarted}
              icon={<FaPaperPlane className="mt-[2px] mr-3" />}
              isLoading={loading}
              isDisabled={loading}
              className="px-4 py-4"
            />
          </div>
        )
      )}

      
    </main>
  );
}
