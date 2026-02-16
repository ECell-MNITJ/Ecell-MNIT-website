'use client';

import { usePathname } from 'next/navigation';

export default function MainPaddingWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isHomePage = pathname === '/esummit';

    return (
        <main className={isHomePage ? '' : 'pt-24 bg-esummit-bg min-h-screen'}>
            {children}
        </main>
    );
}
