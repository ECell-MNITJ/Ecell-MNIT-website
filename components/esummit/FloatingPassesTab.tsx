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
            <div className="bg-gradient-to-br from-esummit-card/95 to-esummit-bg/95 backdrop-blur-xl border-y border-l border-esummit-primary/30 rounded-l-2xl p-4 flex flex-col items-center gap-5 shadow-[0_0_40px_rgba(0,0,0,0.7)] hover:border-esummit-primary/60 hover:shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all duration-500 group-hover:pr-7">
                <div className="text-esummit-primary drop-shadow-[0_0_12px_rgba(37,99,235,0.6)] group-hover:scale-125 transition-transform duration-500">
                    <HiTicket className="w-7 h-7 rotate-90" />
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-white font-black tracking-[0.3em] text-[11px] [writing-mode:vertical-lr] rotate-180 uppercase font-body opacity-90 group-hover:opacity-100 transition-opacity">
                        Passes
                    </span>
                </div>

                {/* Decorative glow effects */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-esummit-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute -inset-1 bg-gradient-to-r from-esummit-primary/20 to-esummit-accent/20 rounded-l-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
            </div>
        </Link>
    );
}
