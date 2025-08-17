'use client';

import { useEffect, useRef, useState } from 'react';
import { refineText } from '@/services/aiService';
import { FaTimes } from 'react-icons/fa';
import { GoCopy } from 'react-icons/go';
import { HiOutlineSparkles } from 'react-icons/hi';
import { LuWandSparkles } from 'react-icons/lu';
import { copyToClipboard } from '@/utils/clipboard';
import { Provider, RefineAction, RefineRequest } from '@/types';
import Button from './Button';

interface AiRefineModalProps {
  isOpen: boolean;
  onClose: () => void;
  text: string;
  userId: string;
}

export default function AiRefineModal({ isOpen, onClose, text, userId }: AiRefineModalProps) {
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<Provider | undefined>(undefined);
  const [action, setAction] = useState<RefineAction | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && firstFocusableRef.current) {
      firstFocusableRef.current.focus();
    }

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        handleSend();
      }
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, select'
        );
        if (focusable.length > 0) {
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, action, text]);

  if (!isOpen) return null;

  const handleSend = async () => {
    if(!provider) {
      setError('Provider not selected');
      return;
    }

    if(!action) {
      setError('Action not selected');
      return;
    }

    if(!userId) {
      setError('User not available');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const request: RefineRequest = {
        text,
        provider, 
        action,
        userId
      }
      const refined = await refineText( request );
      setResult(refined.refinedText);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async () => {
    setLoading(false);
    setError(null);
    setResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6"
        role="dialog"
        aria-modal="true">
        
        <div className='flex justify-between mb-4'>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <HiOutlineSparkles className="w-5 h-5 text-purple-500" /> AI Text Refinement
          </h2>

          <button onClick={handleClose} className="text-slate-500 hover:text-slate-700">
            <FaTimes className="w-5 h-5" />
          </button>
        </div>      

        {/* Provider */}
        <div className='flex justify-between gap-4 mb-4'>
          <div className='w-1/2'>
            <label className="block mb-2 text-sm">
              Ask 
              <select
                value={provider as string}
                onChange={(e) => setProvider(e.target.value as unknown as Provider)}
                className="bg-slate-100 border-slate-50 shadow-2xs rounded p-2 w-full"
              >
                <option>Select Provider</option>
                <option value="groq">Groq</option>
              </select>
            </label>
          </div>
          <div className='w-1/2'>
            <label className="block mb-2 text-sm">
              To
              <select
                value={action as string}
                onChange={(e) => setAction(e.target.value as unknown as RefineAction)}
                className="bg-slate-100 border-slate-50 shadow-2xs rounded p-2 w-full"
              >
                <option>Select Action</option>
                <option value="summarize">Summarize</option>
                <option value="elaborate">Elaborate</option>
                <option value="formalize">Formalize</option>
                <option value="shorten">Shorten</option>
              </select>
            </label>
          </div>
        </div>        

        {/* Original Text Preview */}
        <div className="rounded p-3 bg-slate-100 border-slate-50 shadow-2xs text-sm mb-4 max-h-32 overflow-y-auto scroll-smooth">
          {text}
        </div>

        {/* Send button */}
        {!result && (<Button 
          action={handleSend}
          text="Refine"
          loadingText="Processing..."
          icon={<LuWandSparkles className="w-4 h-4 mr-4" />}
          isLoading={loading}
          isDisabled={loading || !text}
          className="w-full items-center justify-center"
        />)}

        {/* Error */}
        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

        {/* Result */}
        {result && (
          <>
            <div className="mt-3 mb-3 border-slate-50 rounded p-3 bg-slate-100 shadow-2xs">
              <p className="whitespace-pre-wrap text-sm">{result}</p>
            </div>
            <span
              onClick={async () => {await copyToClipboard(text)}}
              className="bg-slate-100 text-slate-500 dark:bg-gray-950 w-[2rem] h-[2rem] bg-opacity-80 backdrop-blur-[0.5rem] border border-white border-opacity-40 shadow-2xl rounded-full cursor-copy flex items-center justify-center hover:scale-[1.15] active:scale-105 transition-all float-end">
              <GoCopy />
            </span>
          </>
        )}
      </div>
    </div>
  );
}
