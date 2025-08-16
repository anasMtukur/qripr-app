'use client';

import { FaSpinner } from "react-icons/fa";
import { ImSpinner10 } from "react-icons/im";
import { twMerge } from "tailwind-merge";

type ButtonProps = {
    type?: "button" | "submit" | "reset";
    text: string;
    loadingText?: string;
    icon: any;
    action: Function;
    className?: string;
    title?: string;
    isDisabled?: boolean;
    isLoading?: boolean;
};
export default function Button({type = 'button', text, loadingText = 'Loading...', icon, action, className, title = '', isDisabled = false, isLoading = false}: ButtonProps) {
  const baseClasses = "flex rounded-full border border-slate-300 py-2 px-4 text-center text-sm transition-all shadow-sm hover:shadow-lg text-slate-600 hover:text-white hover:bg-slate-800 hover:border-slate-800 focus:text-white focus:bg-slate-800 focus:border-slate-800 active:border-slate-800 active:text-white active:bg-slate-800 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
  return (
    <button 
      title={title}
      className={twMerge(baseClasses, className)} 
      onClick={() => action()} 
      type={type}
      disabled={isDisabled || isLoading}
    >
      {icon ? isLoading ? <FaSpinner className='spinner-icon mt-[2px] mr-3' /> : icon: ''} { isLoading ? loadingText : text}
    </button>
  );
}