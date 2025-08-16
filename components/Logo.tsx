'use client';
import Link from 'next/link';
import Image from "next/image";

export default function Logo() {
  return (
    <Link href="/" className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
        <Image
            src="/logo.png"
            alt="Qripr"
            className="h-10 w-25 object-fit"
            width={25}
            height={10}
            priority={true}
            quality={90}
        />
    </Link>
  );
}