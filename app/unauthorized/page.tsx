'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function UnauthorizedContent() {
    const searchParams = useSearchParams();
    const source = searchParams.get('source');

    const homeLink = source === 'esummit' ? '/esummit' : '/';
    const homeText = source === 'esummit' ? 'Return to E-Summit Home' : 'Return to Home';

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
            <h1 className="text-6xl font-bold text-gray-800 mb-4">403</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">Unauthorized Access</h2>
            <p className="text-gray-500 text-center max-w-md mb-8">
                You do not have permission to access this page. If you believe this is an error, please contact the system administrator.
            </p>
            <Link
                href={homeLink}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
                {homeText}
            </Link>
        </div>
    );
}

export default function UnauthorizedPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <UnauthorizedContent />
        </Suspense>
    );
}
