'use client';

import Link from 'next/link';
import { HiTicket } from 'react-icons/hi2';

export default function FloatingPassesTab() {
    return (
        <Link
            href="/esummit/passes"
            className="fixed right-0 top-1/2 -translate-y-1/2 z-[999] group flex"
        >
            <div className="bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border-y border-l border-yellow-500/50 rounded-l-xl p-3 flex flex-col items-center gap-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] border-yellow-500 hover:shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:border-yellow-400 transition-all duration-300 group-hover:pr-5">
                <div className="text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)] group-hover:scale-110 transition-transform duration-300">
                    <HiTicket className="w-6 h-6 rotate-90" />
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-white font-black tracking-[0.25em] text-[13px] [writing-mode:vertical-lr] rotate-180 uppercase font-sans">
                        Passes
                    </span>
                </div>

                {/* Decorative corner glow */}
                <div className="absolute top-0 right-0 w-8 h-8 bg-yellow-500/5 blur-xl pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-yellow-500/5 blur-xl pointer-events-none"></div>
            </div>
        </Link>
    );
}
