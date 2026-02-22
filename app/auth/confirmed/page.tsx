'use client';

import Link from 'next/link';
import { FiCheckCircle } from 'react-icons/fi';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ConfirmedContent() {
    const searchParams = useSearchParams();
    const message = searchParams.get('message');

    return (
        <p className="text-gray-400 mb-8">
            {message || "Your email has been successfully verified. You can now access all features of E-Cell MNIT."}
        </p>
    );
}

export default function ConfirmedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
                <FiCheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6 animate-bounce" />
                <h1 className="text-3xl font-bold mb-4">Email Verified!</h1>
                <Suspense fallback={<p className="text-gray-400 mb-8">Loading...</p>}>
                    <ConfirmedContent />
                </Suspense>
                <div className="flex flex-col gap-3">
                    <Link
                        href="/login"
                        className="bg-primary-golden text-black font-bold py-3 px-6 rounded-xl hover:bg-yellow-500 transition-colors"
                    >
                        Go to Login
                    </Link>
                    <Link
                        href="/"
                        className="bg-zinc-800 text-white font-bold py-3 px-6 rounded-xl hover:bg-zinc-700 transition-colors"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
