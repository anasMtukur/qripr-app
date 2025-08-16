'use client';
import Image from "next/image";
import { motion } from 'framer-motion';

export default function IntroLogo() {

    return (
        <div className='relative'>
            <motion.div initial={{ opacity:0, scale:0 }} animate={{ opacity:1, scale:1 }} transition={{ type: "tween", duration: 0.2 }}>
                <Image
                    src="/logo-text.png"
                    alt="StreakAI"
                    className="h-34 w-34 rounded-full object-cover border-[0.35rem] border-white shadow-xl"
                    width={192}
                    height={192}
                    priority={true}
                    quality={90}
                />
                <motion.span 
                    className="absolute text-4xl bottom-0 right-0" 
                    initial={{ opacity:0, scale:0 }} 
                    animate={{ opacity:1, scale:1 }} 
                    transition={{ type: "spring", stiffness: 125, delay: 0.1, duration: 0.7 }}>
                    👋
                </motion.span>
            </motion.div>					
        </div>
    );
}