'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import FixedBackground from './3d/FixedBackground';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdminRoute = pathname?.startsWith('/admin');
    const isEsummitRoute = pathname?.startsWith('/esummit');
    const isUnauthorizedRoute = pathname === '/unauthorized';

    if (isAdminRoute || isEsummitRoute || isUnauthorizedRoute) {
        // Admin/Unauthorized routes: no navbar/footer, just children
        return <>{children}</>;
    }

    const isHomePage = pathname === '/';

    // Public routes: include navbar and footer
    return (
        <>
            <Navbar />
            {!isHomePage && <FixedBackground />}
            {children}
            <Footer />
        </>
    );
}
