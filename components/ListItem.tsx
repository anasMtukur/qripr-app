'use client';

import { FaSpinner } from "react-icons/fa";
import { ImSpinner10 } from "react-icons/im";
import { twMerge } from "tailwind-merge";

type ListItemProps = {
    index: number;
    title: string;
    subtitle: string;
    rightButtonContent?: any;
    leftButtonContent?: any;
    className?: string;
    highlight?: boolean;
};
export default function ListItem(
    {
        index,
        title, 
        subtitle, 
        rightButtonContent, 
        leftButtonContent, 
        className = '', 
        highlight = false
    }: ListItemProps) {
  const baseClasses = `flex items-center mb-4 cursor-pointer hover:bg-gray-100 p-2 rounded-md ${highlight ? 'bg-slate-300' : ''}`;
  return (
    <div key={index} className={twMerge(baseClasses, className)}>
        {leftButtonContent}

        <div className="flex-1 text-left">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-slate-400 text-sm">{subtitle}</p>
        </div>

        {rightButtonContent}
    </div>
    
  );
}