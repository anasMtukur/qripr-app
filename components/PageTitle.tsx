'use client';
import Link from 'next/link';
import { BsQuestionCircle } from 'react-icons/bs';
import { twMerge } from 'tailwind-merge';

type PageTitleProps = {
    text: string;
    className?: string;
};
export default function PageTitle({text, className}:PageTitleProps) {
    const baseClasses = "text-2xl font-bold";
  return (
    <h1 className={twMerge(baseClasses, className)}>
        {text}
    </h1>
  );
}