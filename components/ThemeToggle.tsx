'use client';
import { useTheme } from '@/contexts/ThemeContext';
import { BsSun, BsMoon } from 'react-icons/bs';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="bg-white dark:bg-gray-950 w-[3rem] h-[3rem] bg-opacity-80 backdrop-blur-[0.5rem] border border-white border-opacity-40 shadow-2xl rounded-full flex items-center justify-center hover:scale-[1.15] active:scale-105 transition-all"
            >
            {theme === "light" ? (
                <BsSun />
            ): (
                <BsMoon />
            )}
        </button>
    );
}