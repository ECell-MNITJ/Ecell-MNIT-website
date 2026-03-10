'use client';

import Link from 'next/link';
import { HiTicket } from 'react-icons/hi2';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function FloatingPassesTab() {
    const [enabled, setEnabled] = useState<boolean | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const checkEnabled = async () => {
            const { data } = await supabase
                .from('esummit_settings')
                .select('passes_enabled')
                .single();
            setEnabled(data?.passes_enabled ?? true);
        };
        checkEnabled();
    }, []);

    if (enabled === false) return null;

    return (
        <Link
            href="/esummit/passes"
            className="fixed right-0 top-1/2 -translate-y-1/2 z-[999] group flex"
        >
            <div className="bg-gradient-to-b from-esummit-card/90 to-esummit-bg/90 backdrop-blur-md border-y border-l border-white/10 rounded-l-xl p-3 flex flex-col items-center gap-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:border-esummit-accent/50 hover:shadow-[0_0_30px_rgba(37,99,235,0.2)] transition-all duration-300 group-hover:pr-5">
                <div className="text-esummit-accent drop-shadow-[0_0_8px_rgba(96,165,250,0.4)] group-hover:scale-110 transition-transform duration-300">
                    <HiTicket className="w-6 h-6 rotate-90" />
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-white font-black tracking-[0.25em] text-[13px] [writing-mode:vertical-lr] rotate-180 uppercase font-sans">
                        Passes
                    </span>
                </div>

                {/* Decorative corner glow */}
                <div className="absolute top-0 right-0 w-8 h-8 bg-esummit-accent/5 blur-xl pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-esummit-accent/5 blur-xl pointer-events-none"></div>
            </div>
        </Link>
    );
}
