'use client';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { GoLock, GoSignIn } from 'react-icons/go';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import { getAccountById } from '@/services/accountService';
import { useEffect, useState } from 'react';
import { MdPersonOutline } from 'react-icons/md';

export default function Header() {
  const { user, logout } = useAuth();
  const [account, setAccount] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      if (user) {
      
        let acc = await getAccountById(user.uid);
        console.log(user.uid, acc)
        if (acc) {
          setAccount(acc);
        }
      
      }
    };

    init();
  }, [user]);

  return (
    
    <header className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 shadow mb-1">
        <Logo />
        <nav className="flex gap-4 items-center">
            {account && 
              <Link href="/account" className={`inline-flex items-center px-3.5 py-3 rounded-full text-xs font-medium bg-${account?.accountType === 'free' ? 'slate' : 'blue'}-100 text-${account?.accountType === 'free' ? 'slate' : 'blue'}-800 hover:bg-${account?.accountType === 'free' ? 'slate' : 'blue'}-300 capitalize`}>
                <MdPersonOutline className='mr-3' />{`${account?.accountType} ${account?.accountType === 'free' ? ': Click to upgrade' : ''}`} 
              </Link>
            }
            {user && 
              <button 
                onClick={logout} 
                className="bg-white text-red-500 dark:bg-gray-950 w-[3rem] h-[3rem] bg-opacity-80 backdrop-blur-[0.5rem] border border-white border-opacity-40 shadow-2xl rounded-full flex items-center justify-center hover:scale-[1.15] active:scale-105 transition-all">
                  <GoLock />
              </button>
            }

            {!user && 
              <Link 
                href="/" 
                className="bg-white text-slate-500 dark:bg-slate-900 dark:text-slate-100 w-[3rem] h-[3rem] bg-opacity-80 backdrop-blur-[0.5rem] border border-white border-opacity-40 shadow-2xl rounded-full flex items-center justify-center hover:scale-[1.15] active:scale-105 transition-all">
                  <GoSignIn />
              </Link>
            }
            <ThemeToggle />
        </nav>
    </header>
  );
}