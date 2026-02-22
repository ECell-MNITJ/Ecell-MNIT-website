'use client';

import Link from 'next/link';
import { FiAlertTriangle } from 'react-icons/fi';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    return (
        <p className="text-gray-400 mb-8">
            {error ? decodeURIComponent(error) : "There was an error verifying your email. The link may have expired or is invalid."}
        </p>
    );
}

export default function AuthErrorPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
            <div className="bg-zinc-900 border border-red-900/30 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
                <FiAlertTriangle className="w-20 h-20 text-red-500 mx-auto mb-6" />
                <h1 className="text-3xl font-bold mb-4">Verification Failed</h1>
                <Suspense fallback={<p className="text-gray-400 mb-8">Loading...</p>}>
                    <ErrorContent />
                </Suspense>
                <div className="flex flex-col gap-3">
                    <Link
                        href="/login"
                        className="bg-zinc-800 text-white font-bold py-3 px-6 rounded-xl hover:bg-zinc-700 transition-colors"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
