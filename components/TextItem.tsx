'use client';

import { copyToClipboard } from "@/utils/clipboard";
import { formatDate } from "@/utils/dateFormatter";
import { truncateString } from "@/utils/messageFormatter";
import { Timestamp } from "firebase/firestore";
import { GoCopy, GoTrash } from "react-icons/go";
import AiButton from "./AiButton";

type TextItemProps = {
    index: number;
    sender: string;
    text: string;
    sentOn: Timestamp;
    isDecrypted?: boolean;
};
export default function TextItemProps({index, sender, text, sentOn, isDecrypted = true}: TextItemProps) {
  return (
    <div key={index} className="flex flex-col border-b border-slate-200 bg-white p-3 gap-3">
        <div className="flex justify-between align-middle w-full">
            <p className="text-xs text-slate-400 font-light">
                {sender}<br />
                <span>{formatDate(sentOn)}</span>
            </p>

            <div className="flex justify-end gap-3">
                {isDecrypted && <span
                    onClick={async () => {await copyToClipboard(text)}}
                    className="text-slate-500 dark:text-slate-100 shadow-2xl rounded-full flex items-center justify-center hover:scale-[1.15] active:scale-105 transition-all cursor-pointer">
                    <GoCopy />
                </span>
                }
                <AiButton text={text} />
                <span className="text-red-500 dark:text-red-500 shadow-2xl rounded-full flex items-center justify-center hover:scale-[1.15] active:scale-105 transition-all cursor-pointer">
                    <GoTrash />
                </span>
            </div>
        </div>
        <div className="py-2.5">
            <p className={`w-full font-light text-slate-${isDecrypted ? '700' : '100'}`}>
                {isDecrypted ? truncateString(text) : '[This message is end-to-end encrypted.]'}
            </p>
        </div>
    </div>
  );
}