'use client';

import { useState } from "react";
import AiRefineModal from "./AIRefineModal";
import { PiSparkleThin } from "react-icons/pi";
import { useAuth } from "@/contexts/AuthContext";

type AiButtonProps = {
    text: string;
};
export default function AiButton({text}: AiButtonProps) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
      <div>
        <button
          className="text-slate-500 dark:text-slate-100 shadow-2xl rounded-full flex items-center justify-center hover:scale-[1.15] active:scale-105 transition-all cursor-pointer"
          onClick={() => setOpen(true)}>
          <PiSparkleThin className="mt-2" />
        </button>

        <AiRefineModal
          text={text}
          isOpen={open}
          userId={user?.uid ? user?.uid : ''}
          onClose={() => setOpen(false)}
        />
      </div>
  );
}
