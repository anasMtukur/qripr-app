'use client';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { GoMail } from 'react-icons/go';
import Logo from './Logo';
import { BsQuestionCircle } from 'react-icons/bs';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <footer className="flex justify-between items-center p-4 bg-white dark:bg-gray-800">
        <span className='text-2xs text-slate-300'> &copy; DottedI Solutions 2025</span>
        <nav className="flex gap-4 items-center">
            <Link href="/support" className="text-sm">
                <BsQuestionCircle />
            </Link>
        </nav>
    </footer>
  );
}