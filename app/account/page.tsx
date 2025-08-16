'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaMagic } from 'react-icons/fa';
import Button from '@/components/Button';
import { formatDate } from '@/utils/dateFormatter';
import { useAuth } from '@/contexts/AuthContext';
import { getAccountById } from '@/services/accountService';
import Script from 'next/script';
import { startStripePayment, startPaystackPayment } from '@/services/paymentProcessingService';

export default function AccountPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [paystackReady, setPaystackReady] = useState(false);

  useEffect(() => {
    if (user) {
      getAccountById(user.uid).then(acc => setAccount(acc));
    }
  }, [user]);

  return (
    <main className="min-h-[84vh] flex flex-col items-center justify-start text-center mb-1 p-6">
      <Script src="https://js.paystack.co/v1/inline.js" strategy="afterInteractive" onLoad={() => setPaystackReady(true)} />
      <h1 className="text-4xl font-bold mb-4">Hi, {user?.displayName}</h1>
      <p className="mb-6">Your account details</p>

      {account ? (
        <div className="relative flex flex-col my-6 bg-white shadow-sm border border-slate-200 rounded-lg w-96">
          <div className="p-4">
            <div className="divide-y divide-slate-200">
              <div className="text-start py-4">
                <strong>Name:</strong>{' '}
                <span className="ml-auto float-end capitalize">{account?.name}</span>
              </div>
              <div className="text-start py-4">
                <strong>Email:</strong>{' '}
                <span className="ml-auto float-end">{account?.email}</span>
              </div>
              <div className="text-start py-4">
                <strong>Account Type:</strong>{' '}
                <span
                  className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-${
                    account?.accountType === 'free' ? 'slate' : 'blue'
                  }-100 text-${account?.accountType === 'free' ? 'slate' : 'blue'}-800 capitalize float-end`}
                >
                  {account?.accountType}
                </span>
              </div>
              <div className="text-start py-4">
                <strong>Created At:</strong>{' '}
                <span className="ml-auto float-end">{formatDate(account?.createdAt)}</span>
              </div>
              {account?.proSince && (
                <div className="text-start py-4">
                  <strong>Pro Since:</strong>{' '}
                  <span className="ml-auto float-end">{formatDate(account?.proSince)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p>Loading account details</p>
      )}

      {account && account?.accountType === 'free' && (
        <div className="w-full mt-4 flex flex-col items-center gap-3">
          <Button
            text="Upgrade to Pro"
            action={() => startStripePayment(user, account)}
            className="w-96 px-4 py-4 justify-center-safe"
            icon={<FaMagic className="mt-[2px] mr-3" />}
            isLoading={loading}
          />
          <Button
            text="Upgrade with Paystack"
            action={() => startPaystackPayment(user, account, router)}
            className="w-96 px-4 py-4 justify-center-safe bg-green-500 hover:bg-green-600 text-white"
            icon={<FaMagic className="mt-[2px] mr-3" />}
            isLoading={loading}
            isDisabled={loading || !paystackReady}
          />
        </div>
      )}
    </main>
  );
}
