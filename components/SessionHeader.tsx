'use client';

import Link from "next/link";
import { FaTimes } from "react-icons/fa";
import { MdPhonelink } from "react-icons/md";

type SessionHeaderProps = {
    title: string;
    iconLeft: any;
    actionIconLeft: Function;
    contentRight: any;
    isAuthenticated: boolean;
    isCreator: boolean;
    showContentRignt: boolean;
};
export default function SessionHeader({title, iconLeft, actionIconLeft, contentRight, isAuthenticated, isCreator, showContentRignt}: SessionHeaderProps) {
  return (
    <header className="bg-white p-4 text-gray-700 border-b border-slate-200 flex justify-between items-center">
        {isCreator && <button onClick={() => actionIconLeft()}
        className="flex md:hidden text-slate-500 bg-slate-100 dark:bg-slate-950 dark:text-slate-100 w-[2rem] h-[2rem] bg-opacity-80 backdrop-blur-[0.5rem] border border-white border-opacity-40 shadow-2xl rounded-full items-center justify-center hover:scale-[1.15] active:scale-105 transition-all">
            {iconLeft}
        </button>}
        <h1 className="text-2xl font-semibold">{title}</h1>

        {showContentRignt ? contentRight: ''}
    </header>
  );
}