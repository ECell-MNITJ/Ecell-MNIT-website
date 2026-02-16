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

    const isAuthRoute = pathname === '/login' || pathname === '/signup';

    if (isAdminRoute || isEsummitRoute || isUnauthorizedRoute) {
        // Admin/Unauthorized routes: no navbar/footer, just children
        // Note: Admin pages usually have their own sidebars/layouts
        return <>{children}</>;
    }

    const isHomePage = pathname === '/';

    // Public routes
    return (
        <>
            {!isAuthRoute && <Navbar />}
            {/* Show FixedBackground on all pages except Home (which has its own scroll scene) */}
            {!isHomePage && <FixedBackground />}
            {children}
            {!isAuthRoute && <Footer />}
        </>
    );
}
