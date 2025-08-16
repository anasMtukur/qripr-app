'use client';

import { copyToClipboard } from "@/utils/clipboard";
import { GoCopy } from "react-icons/go";
import QRCode from "react-qr-code";

type QRCodeViewProps = {
    text: string;
};

export default function QRCodeView({text}: QRCodeViewProps) {
  return (
    <>
        <h1 className="text-2xl font-semibold mb-2">Add new devices</h1>
        <div className="mx-auto bg-white p-4 inline-block">
            <QRCode className="mx-auto" value={text} />
        </div>            
        <div className="w-full">
            <div className="relative">
                <input 
                type="email" 
                readOnly={true}
                value={text}
                className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-3 pr-16 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow" placeholder="Email Address" />
                <button
                    onClick={async () => {await copyToClipboard(text)}}
                    className="absolute right-1 top-1 rounded py-1.5 px-2.5 border border-slate-200 text-center text-sm text-slate-500 transition-all shadow-sm hover:shadow focus:bg-slate-700 focus:text-white focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                    type="button">
                    <GoCopy  />
                </button>
            </div>
        </div>
    </>
  );
}